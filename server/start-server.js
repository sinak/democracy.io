const app = require("./app");
const logger = require("./logger");

const Legislators = require("./dio/Legislators");
const LegislatorsSearchUpdater = require("./dio/LegislatorsSearchUpdater");
const CongressLegislators = require("./services/CongressLegislators");

/**
 * waits for legislator data to load then starts server
 */
module.exports = async function() {
  const updater = new LegislatorsSearchUpdater(
    Legislators,
    CongressLegislators.fetchFile
  );
  await updater.update();

  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
};
