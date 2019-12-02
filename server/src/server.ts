import * as Sentry from "@sentry/node";

// load .env file
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const logger = require("./logger");

// sentry exception tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  disabled: process.env.NODE_ENV === "test"
});

const Legislators = require("./congress-legislators/Legislators");
const LegislatorsSearchUpdater = require("./congress-legislators/LegislatorsSearchUpdater");
const LegislatorsFile = require("./congress-legislators/LegislatorsFile");

/**
 * waits for legislator data to load then starts server
 */
const updater = new LegislatorsSearchUpdater(
  Legislators,
  LegislatorsFile.fetchFile
);

updater.update().then(() => {
  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.default.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
});
