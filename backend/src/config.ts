import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../..');

// Load the repo-root .env first, then allow backend/.env as a fallback for missing keys.
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, 'backend/.env'), override: false });

function parseInteger(value: string | undefined, fallback: number) {
  const parsed = parseInt(value || '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFloatValue(value: string | undefined, fallback: number) {
  const parsed = parseFloat(value || '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUrl(value: string | undefined) {
  return (value || '').trim().replace(/\/+$/, '');
}

function parseAdminEmails(value: string | undefined) {
  const fallback = 'sohailkhanifar@gmail.com,sina.khanifar@gmail.com';

  return (value || fallback)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

const supabaseUrl = normalizeUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const supabaseIssuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : '';
const supabaseJwksUrl = supabaseIssuer ? `${supabaseIssuer}/.well-known/jwks.json` : '';

export const config = {
  port: parseInteger(process.env.PORT, 3001),

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
    smtpPort: parseInteger(process.env.EMAIL_COPY_SMTP_PORT, 587),
    smtpSecure: process.env.EMAIL_COPY_SMTP_SECURE === 'true',
    smtpUser: process.env.EMAIL_COPY_SMTP_USER || '',
    smtpPass: process.env.EMAIL_COPY_SMTP_PASS || '',
    fromName: process.env.EMAIL_COPY_FROM_NAME || 'Democracy.io',
    fromAddress: process.env.EMAIL_COPY_FROM_ADDRESS || process.env.EMAIL_COPY_FROM || '',
  },

  database: {
    url: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '',
    ssl: process.env.DATABASE_SSL,
    sslRejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
  },

  supabase: {
    url: supabaseUrl,
    issuer: supabaseIssuer,
    jwksUrl: supabaseJwksUrl,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  },

  adminEmails: parseAdminEmails(process.env.ADMIN_EMAILS),

  ipSalt: process.env.IP_SALT || 'default-salt',
  campaignTag: process.env.CAMPAIGN_TAG || 'democracy.io',

  openRouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.5:free',
    httpReferer: process.env.OPENROUTER_HTTP_REFERER || '',
    title: process.env.OPENROUTER_TITLE || '',
    maxCompletionTokens: parseInteger(process.env.OPENROUTER_MAX_COMPLETION_TOKENS, 700),
    temperature: parseFloatValue(process.env.OPENROUTER_TEMPERATURE, 0.7),
  },

  draftRateLimit: {
    windowMs: parseInteger(process.env.DRAFT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
    max: parseInteger(process.env.DRAFT_RATE_LIMIT_MAX, 20),
  },
};
