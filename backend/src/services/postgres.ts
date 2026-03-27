import { URL } from 'node:url';
import pg from 'pg';
import type { Pool as PgPool } from 'pg';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { extractErrorMessage } from '../helpers/error-message.js';

const { Pool } = pg;

let pool: PgPool | null = null;
let hasLoggedDisabled = false;

function getDatabaseUrl() {
  return config.database.url
    .trim()
    .replace(/^(postgres(?:ql)?:\/\/[^:]+:)\[([^\]]+)\]@/i, '$1$2@');
}

function shouldUseSsl(connectionString: string) {
  if (config.database.ssl === 'true') {
    return true;
  }

  if (config.database.ssl === 'false') {
    return false;
  }

  try {
    const hostname = new URL(connectionString).hostname;
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  } catch {
    return true;
  }
}

export function getPostgresPool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    if (!hasLoggedDisabled) {
      logger.info('[Postgres] Message logging disabled because DATABASE_URL is not set');
      hasLoggedDisabled = true;
    }

    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 3_000,
      query_timeout: 3_000,
      ssl: shouldUseSsl(connectionString)
        ? { rejectUnauthorized: config.database.sslRejectUnauthorized }
        : undefined,
    });

    pool.on('error', (err) => {
      logger.error(`[Postgres] Unexpected pool error: ${extractErrorMessage(err)}`);
    });
  }

  return pool;
}

export async function checkPostgresConnection() {
  const currentPool = getPostgresPool();
  if (!currentPool) {
    return false;
  }

  try {
    await currentPool.query('select 1');
    logger.info('[Postgres] Connected');
    return true;
  } catch (err) {
    logger.warn(`[Postgres] Connection check failed: ${extractErrorMessage(err)}`);
    return false;
  }
}
