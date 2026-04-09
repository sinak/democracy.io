import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { legislators } from './dio/legislator-search.js';
import { fetchLegislators } from './services/congress-legislators.js';
import { checkPostgresConnection } from './services/postgres.js';

// Health check
const app = createApp();

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
    void checkPostgresConnection();
  });
}

start();
