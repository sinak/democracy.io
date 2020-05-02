/**
 * Democracy.io Server Entrypoint
 */

// load .env file
const dotenv = require("dotenv");
dotenv.config({ debug: true });

import "source-map-support/register";
import * as Sentry from "@sentry/node";
import Legislators from "./legislators/LegislatorsSearchInstance";
import * as CongressLegislators from "./datasets/congress-legislators";
import logger from "./logger";
import app from "./app";

// sentry exception tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

logger.info("congress-legislators - Fetching dataset");
CongressLegislators.fetch().then((legislators) => {
  Legislators.loadLegislators(legislators);
  logger.info("congress-legislators - Successfully loaded");

  // update legislators automatically
  setInterval(async () => {
    try {
      const legislators = await CongressLegislators.fetch();
      Legislators.loadLegislators(legislators);
    } catch (e) {
      Sentry.captureException(e);
      logger.error("Scheduled legislators update failed", e);
    }
  }, 43_200);

  // start web server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info("Server listening on port " + port);
  });
});
