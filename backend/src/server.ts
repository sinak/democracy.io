import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { logger } from './logger.js';
import { legislators } from './dio/legislator-search.js';
import { fetchLegislators } from './services/congress-legislators.js';

import locationRoutes from './routes/location.js';
import legislatorsRoutes from './routes/legislators.js';
import legislatorRoutes from './routes/legislator.js';
import formElementsRoutes from './routes/form-elements.js';
import captchaSolutionRoutes from './routes/captcha-solution.js';
import subscriptionRoutes from './routes/subscription.js';
import draftMessageRoutes from './routes/draft-message.js';
import topicSuggestionRoutes from './routes/topic-suggestion.js';
import shareTopicRoutes from './routes/share-topic.js';
import messageCopyRoutes from './routes/message-copy.js';
import monitorRoutes from './routes/monitor.js';
import { checkPostgresConnection } from './services/postgres.js';
import { captureClientDiagnostic } from './services/sentry.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../..');
const frontendDistDir = path.join(repoRoot, 'frontend/dist');
const frontendIndexPath = path.join(frontendDistDir, 'index.html');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting on message endpoints (200 requests per 7 days)
const skipLocalRateLimit = (req: express.Request) => {
  const ip = req.ip || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

const messageLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000,
  max: 200,
  message: { status: 'error', message: 'Too many requests', code: 429, data: null },
  skip: skipLocalRateLimit,
});

const draftLimiter = rateLimit({
  windowMs: config.draftRateLimit.windowMs,
  max: config.draftRateLimit.max,
  message: { status: 'error', message: 'Too many draft requests', code: 429, data: null },
  skip: skipLocalRateLimit,
});

const monitorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: { status: 'error', message: 'Too many requests', code: 429, data: null },
  skip: skipLocalRateLimit,
});

app.use(/\/api.*\/message$/, messageLimiter);
app.use('/api/1/draft-message', draftLimiter);
app.use('/api/1/topic-suggestion', draftLimiter);
app.use('/api/1/share-topic', draftLimiter);
app.use('/api/1/monitor', monitorLimiter);

// API routes (mounted at /api/1)
app.use('/api/1', locationRoutes);
app.use('/api/1', legislatorsRoutes);
app.use('/api/1', legislatorRoutes);
app.use('/api/1', formElementsRoutes);
app.use('/api/1', captchaSolutionRoutes);
app.use('/api/1', subscriptionRoutes);
app.use('/api/1', draftMessageRoutes);
app.use('/api/1', topicSuggestionRoutes);
app.use('/api/1', shareTopicRoutes);
app.use('/api/1', messageCopyRoutes);
app.use('/api/1', monitorRoutes);

// Exception logging endpoint
app.post('/api/1/exception', (req, res) => {
  const body: Record<string, unknown> =
    typeof req.body === 'object' && req.body !== null ? req.body : {};
  logger.warn('[Client Exception]', {
    name: body.name,
    level: body.level,
    tags: body.tags,
    url: body.url,
    userAgent: body.userAgent,
  });

  void captureClientDiagnostic(body, req.get('user-agent')).catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('[Client Exception] Failed to forward diagnostic to Sentry', { message });
  });

  res.sendStatus(200);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', legislatorsLoaded: legislators.loaded });
});

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistDir));

  app.get(/^(?!\/api(?:\/|$)|\/health$).*/, (_req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  logger.warn(`Frontend build not found at ${frontendIndexPath}; serving API only`);
}

// Load legislator data, then start server
async function start() {
  try {
    logger.info('Fetching legislator data...');
    const data = await fetchLegislators();
    legislators.loadLegislators(data);
    logger.info(`Loaded ${data.length} legislators`);
  } catch (err) {
    logger.error('Failed to load legislator data on startup', err);
    logger.warn('Server starting without legislator data — will retry in 12 hours');
  }

  // Schedule refresh every 12 hours
  setInterval(async () => {
    try {
      logger.info('[Congress Legislators] Automatic update');
      const data = await fetchLegislators();
      legislators.loadLegislators(data);
    } catch (err) {
      logger.error('[Congress Legislators] Automatic update failed', err);
    }
  }, 12 * 60 * 60 * 1000);

  app.listen(config.port, () => {
    logger.info(`Backend server listening on http://localhost:${config.port}`);
    void checkPostgresConnection();
  });
}

start();
