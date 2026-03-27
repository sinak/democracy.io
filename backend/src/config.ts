import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../..');

// Load the repo-root .env first, then allow backend/.env as a fallback for missing keys.
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, 'backend/.env'), override: false });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),

  smartyStreets: {
    addressUrl: process.env.SMARTY_STREETS_ADDRESS_URL || 'https://us-street.api.smartystreets.com',
    id: process.env.SMARTY_STREETS_ID || '',
    token: process.env.SMARTY_STREETS_TOKEN || '',
  },

  potc: {
    baseUrl: process.env.POTC_BASE_URL || 'https://congressforms.eff.org',
    debugKey: process.env.POTC_DEBUG_KEY || '',
  },

  effCivicCrm: {
    url: process.env.EFF_CIVIC_CRM_URL || 'https://supporters.eff.org',
    siteKey: process.env.EFF_CIVIC_CRM_SITE_KEY || '',
  },

  emailCopy: {
    smtpUrl: process.env.EMAIL_COPY_SMTP_URL || '',
    smtpHost: process.env.EMAIL_COPY_SMTP_HOST || '',
    smtpPort: parseInt(process.env.EMAIL_COPY_SMTP_PORT || '587', 10),
    smtpSecure: process.env.EMAIL_COPY_SMTP_SECURE === 'true',
    smtpUser: process.env.EMAIL_COPY_SMTP_USER || '',
    smtpPass: process.env.EMAIL_COPY_SMTP_PASS || '',
    fromName: process.env.EMAIL_COPY_FROM_NAME || 'Democracy.io',
    fromAddress: process.env.EMAIL_COPY_FROM_ADDRESS || process.env.EMAIL_COPY_FROM || '',
  },

  ipSalt: process.env.IP_SALT || 'default-salt',
  campaignTag: process.env.CAMPAIGN_TAG || 'democracy.io',

  openRouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.5:free',
    httpReferer: process.env.OPENROUTER_HTTP_REFERER || '',
    title: process.env.OPENROUTER_TITLE || '',
    maxCompletionTokens: parseInt(process.env.OPENROUTER_MAX_COMPLETION_TOKENS || '700', 10),
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
  },

  draftRateLimit: {
    windowMs: parseInt(process.env.DRAFT_RATE_LIMIT_WINDOW_MS || String(60 * 60 * 1000), 10),
    max: parseInt(process.env.DRAFT_RATE_LIMIT_MAX || '20', 10),
  },
};
