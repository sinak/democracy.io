import axios from 'axios';
import { Router, raw } from 'express';
import { logger } from '../logger.js';

const router = Router();

const MAX_ENVELOPE_BYTES = 200 * 1024;

const allowedDsn = process.env.SENTRY_ALLOWED_DSN || process.env.VITE_SENTRY_DSN || '';
const allowedDsnUrl = parseDsn(allowedDsn);
if (allowedDsn && !allowedDsnUrl) {
  logger.warn('[monitor] Sentry DSN is set but invalid; tunnel will reject all events');
}

type ParsedDsn = {
  host: string;
  publicKey: string;
  projectId: string;
};

function parseDsn(dsn: string): ParsedDsn | null {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, '').split('/')[0];
    if (!url.username || !url.host || !projectId) return null;
    return { host: url.host, publicKey: url.username, projectId };
  } catch {
    return null;
  }
}

router.post(
  '/monitor',
  raw({ type: '*/*', limit: MAX_ENVELOPE_BYTES }),
  async (req, res) => {
    const body = req.body as Buffer | undefined;
    if (!body || body.length === 0) {
      return res.sendStatus(400);
    }

    const text = body.toString('utf8');
    const newlineIdx = text.indexOf('\n');
    if (newlineIdx === -1) {
      return res.sendStatus(400);
    }

    let header: { dsn?: string };
    try {
      header = JSON.parse(text.slice(0, newlineIdx));
    } catch {
      return res.sendStatus(400);
    }

    const envelopeDsn = parseDsn(header.dsn || '');
    if (!envelopeDsn) {
      logger.warn('[monitor] Envelope missing or invalid DSN');
      return res.sendStatus(400);
    }

    if (allowedDsnUrl) {
      const matches =
        envelopeDsn.host === allowedDsnUrl.host &&
        envelopeDsn.projectId === allowedDsnUrl.projectId &&
        envelopeDsn.publicKey === allowedDsnUrl.publicKey;
      if (!matches) {
        logger.warn('[monitor] Rejected envelope with mismatched DSN', {
          host: envelopeDsn.host,
          projectId: envelopeDsn.projectId,
        });
        return res.sendStatus(403);
      }
    } else {
      logSummary(text);
      return res.sendStatus(202);
    }

    const upstreamUrl =
      `https://${envelopeDsn.host}/api/${envelopeDsn.projectId}/envelope/` +
      `?sentry_key=${encodeURIComponent(envelopeDsn.publicKey)}&sentry_version=7`;

    try {
      const upstream = await axios.post(upstreamUrl, text, {
        headers: { 'Content-Type': 'application/x-sentry-envelope' },
        validateStatus: () => true,
        timeout: 10_000,
      });
      if (upstream.status >= 400) {
        logger.warn('[monitor] Sentry rejected envelope', {
          status: upstream.status,
          response:
            typeof upstream.data === 'string'
              ? upstream.data.slice(0, 500)
              : JSON.stringify(upstream.data).slice(0, 500),
        });
      }
      return res.sendStatus(upstream.status);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[monitor] Failed to forward envelope to Sentry', { message });
      return res.sendStatus(502);
    }
  }
);

function logSummary(envelopeText: string) {
  const lines = envelopeText.split('\n').filter(Boolean);
  for (let i = 1; i < lines.length; i += 2) {
    const payload = lines[i + 1];
    if (!payload) continue;
    try {
      const parsed = JSON.parse(payload);
      logger.warn('[monitor] Sentry event (no upstream configured)', {
        message: parsed.message,
        level: parsed.level,
        extra: parsed.extra,
        userAgent: parsed.request?.headers?.['User-Agent'],
        release: parsed.release,
      });
    } catch {
      // Non-JSON envelope item (e.g. attachments) — skip.
    }
  }
}

export default router;
