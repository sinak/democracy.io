import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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

const app = express();

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

app.use(/\/api.*\/message$/, messageLimiter);
app.use('/api/1/draft-message', draftLimiter);
app.use('/api/1/topic-suggestion', draftLimiter);

// API routes (mounted at /api/1)
app.use('/api/1', locationRoutes);
app.use('/api/1', legislatorsRoutes);
app.use('/api/1', legislatorRoutes);
app.use('/api/1', formElementsRoutes);
app.use('/api/1', captchaSolutionRoutes);
app.use('/api/1', subscriptionRoutes);
app.use('/api/1', draftMessageRoutes);
app.use('/api/1', topicSuggestionRoutes);

// Exception logging endpoint
app.post('/api/1/exception', (req, res) => {
  logger.warn('[Client Exception]', req.body);
  res.sendStatus(200);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', legislatorsLoaded: legislators.loaded });
});

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
  });
}

start();
