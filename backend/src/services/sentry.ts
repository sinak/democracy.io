import axios from 'axios';
import { randomBytes } from 'node:crypto';
import { logger } from '../logger.js';

type ParsedDsn = {
  host: string;
  publicKey: string;
  projectId: string;
};

type ClientDiagnosticPayload = {
  name?: unknown;
  level?: unknown;
  tags?: unknown;
  extra?: unknown;
  error?: unknown;
  url?: unknown;
  userAgent?: unknown;
  timestamp?: unknown;
};

const MAX_STRING_LENGTH = 1000;
const MAX_EXTRA_DEPTH = 5;
const MAX_ARRAY_ITEMS = 25;
const MAX_OBJECT_KEYS = 75;

export function getConfiguredSentryDsn() {
  return process.env.SENTRY_ALLOWED_DSN || process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN || '';
}

export function parseDsn(dsn: string): ParsedDsn | null {
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

export async function forwardSentryEnvelope(envelopeDsn: ParsedDsn, envelopeText: string) {
  const upstreamUrl =
    `https://${envelopeDsn.host}/api/${envelopeDsn.projectId}/envelope/` +
    `?sentry_key=${encodeURIComponent(envelopeDsn.publicKey)}&sentry_version=7`;

  return axios.post(upstreamUrl, envelopeText, {
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
    validateStatus: () => true,
    timeout: 10_000,
  });
}

export async function captureClientDiagnostic(payload: ClientDiagnosticPayload, requestUserAgent?: string) {
  const dsn = getConfiguredSentryDsn();
  const parsedDsn = parseDsn(dsn);
  if (!parsedDsn) return { forwarded: false, reason: dsn ? 'invalid-dsn' : 'no-dsn' };

  const eventId = randomBytes(16).toString('hex');
  const sentAt = new Date().toISOString();
  const name = sanitizeString(payload.name, 'client-diagnostic');
  const level = normalizeLevel(payload.level);
  const userAgent = sanitizeString(payload.userAgent || requestUserAgent, undefined);
  const error = normalizeClientError(payload.error);

  const event = {
    event_id: eventId,
    timestamp: normalizeTimestamp(payload.timestamp) || sentAt,
    platform: 'javascript',
    logger: 'client-diagnostic-fallback',
    level,
    message: name,
    release: sanitizeString(process.env.SENTRY_RELEASE || process.env.VITE_SENTRY_RELEASE, undefined),
    environment: sanitizeString(process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV, undefined),
    tags: {
      source: 'client-diagnostic-fallback',
      diagnostic_name: name,
      ...sanitizeTags(payload.tags),
    },
    extra: {
      ...sanitizeExtraObject(payload.extra),
      fallbackForwardedBy: '/api/1/exception',
      clientError: error,
    },
    request: {
      url: sanitizeString(payload.url, undefined),
      headers: userAgent ? { 'User-Agent': userAgent } : undefined,
    },
    exception: error
      ? {
          values: [
            {
              type: error.name || 'ClientDiagnosticError',
              value: error.message || name,
            },
          ],
        }
      : undefined,
  };

  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: sentAt, dsn }),
    JSON.stringify({ type: 'event' }),
    JSON.stringify(event),
  ].join('\n');

  const upstream = await forwardSentryEnvelope(parsedDsn, `${envelope}\n`);
  if (upstream.status >= 400) {
    logger.warn('[sentry] Rejected client diagnostic fallback event', {
      status: upstream.status,
      response:
        typeof upstream.data === 'string'
          ? upstream.data.slice(0, 500)
          : JSON.stringify(upstream.data).slice(0, 500),
    });
  }

  return { forwarded: upstream.status < 400, status: upstream.status };
}

function sanitizeString(value: unknown, fallback: string | undefined) {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, MAX_STRING_LENGTH);
}

function normalizeLevel(value: unknown) {
  if (
    value === 'fatal' ||
    value === 'error' ||
    value === 'warning' ||
    value === 'log' ||
    value === 'info' ||
    value === 'debug'
  ) {
    return value;
  }

  return 'warning';
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function normalizeClientError(value: unknown) {
  const safe = sanitizeExtra(value);
  if (!safe || typeof safe !== 'object' || Array.isArray(safe)) return undefined;

  const record = safe as Record<string, unknown>;
  return {
    name: sanitizeString(record.name, undefined),
    message: sanitizeString(record.message, undefined),
    stack: sanitizeString(record.stack, undefined),
  };
}

function sanitizeTags(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const tags: Record<string, string> = {};
  for (const [key, tagValue] of Object.entries(value).slice(0, MAX_OBJECT_KEYS)) {
    if (!/^[A-Za-z0-9_.:-]+$/.test(key)) continue;
    if (
      typeof tagValue === 'string' ||
      typeof tagValue === 'number' ||
      typeof tagValue === 'boolean'
    ) {
      tags[key] = String(tagValue).slice(0, 200);
    }
  }

  return tags;
}

function sanitizeExtraObject(value: unknown) {
  const safe = sanitizeExtra(value);
  if (!safe || typeof safe !== 'object' || Array.isArray(safe)) return {};
  return safe as Record<string, unknown>;
}

function sanitizeExtra(value: unknown, depth = 0): unknown {
  if (depth > MAX_EXTRA_DEPTH) return '[MaxDepth]';
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') return value.slice(0, MAX_STRING_LENGTH);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeExtra(item, depth + 1));
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value).slice(0, MAX_OBJECT_KEYS)) {
      sanitized[key] = sanitizeExtra(nestedValue, depth + 1);
    }
    return sanitized;
  }

  return String(value).slice(0, MAX_STRING_LENGTH);
}
