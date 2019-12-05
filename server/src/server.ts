/**
 * Democracy.io Server Entrypoint
 */

// load .env file
const dotenv = require("dotenv");
dotenv.config({ debug: true });

import "source-map-support/register";
import * as Sentry from "@sentry/node";
import Legislators from "./legislators/LegislatorsSearchInstance";
import LegislatorsSearchUpdater from "./legislators/LegislatorsSearchUpdater";
import * as CongressLegislatorsFile from "./datasets/congress-legislators-file";
import logger from "./logger";
import app from "./app";

// sentry exception tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN
});

/**
 * waits for legislator data to load then starts server
 */
const updater = new LegislatorsSearchUpdater(
  Legislators,
  CongressLegislatorsFile.fetchFile
);

updater.update().then(() => {
  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
});
