const app = require("./app");
const logger = require("./logger");

const Legislators = require("./congress-legislators/Legislators");
const LegislatorsSearchUpdater = require("./congress-legislators/LegislatorsSearchUpdater");
const LegislatorsFile = require("./congress-legislators/LegislatorsFile");

/**
 * waits for legislator data to load then starts server
 */
module.exports = async function() {
  const updater = new LegislatorsSearchUpdater(
    Legislators,
    LegislatorsFile.fetchFile
  );
  await updater.update();

  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
};
