import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthMiddleware, createSupabaseJwtVerifier, type AuthVerifier } from './auth.js';
import { config } from './config.js';
import { logger } from './logger.js';
import type { CampaignService } from './services/campaigns.js';
import { createCampaignService, createPostgresCampaignRepository } from './services/campaigns.js';

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
import { createAdminCampaignRoutes } from './routes/admin-campaigns.js';
import { createCampaignRoutes } from './routes/campaigns.js';
import { createPublicCampaignRoutes } from './routes/public-campaigns.js';
import { captureClientDiagnostic } from './services/sentry.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../..');
const frontendDistDir = path.join(repoRoot, 'frontend/dist');
const frontendIndexPath = path.join(frontendDistDir, 'index.html');

export interface CreateAppOptions {
  includeFrontend?: boolean;
  authVerifier?: AuthVerifier;
  campaignService?: CampaignService;
}

// Rate limiting on message endpoints (200 requests per 7 days)
function skipLocalRateLimit(req: express.Request) {
  const ip = req.ip || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

export function createApp(options: CreateAppOptions = {}) {
  const authVerifier = options.authVerifier || createSupabaseJwtVerifier();
  const campaignService =
    options.campaignService || createCampaignService(createPostgresCampaignRepository());
  const { requireAuthenticatedUser, requireAdminUser } = createAuthMiddleware(authVerifier);

  const app = express();
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
  app.use('/api/1', createCampaignRoutes({ campaignService, requireAuthenticatedUser }));
  app.use('/api/1', createAdminCampaignRoutes({ campaignService, requireAuthenticatedUser, requireAdminUser }));
  app.use('/api/1', createPublicCampaignRoutes({ campaignService }));

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

  if (options.includeFrontend !== false) {
    if (fs.existsSync(frontendIndexPath)) {
      app.use(express.static(frontendDistDir));

      app.get(/^(?!\/api(?:\/|$)|\/health$).*/, (_req, res) => {
        res.sendFile(frontendIndexPath);
      });
    } else {
      logger.warn(`Frontend build not found at ${frontendIndexPath}; serving API only`);
    }
  }

  return app;
}
