// Passes through to server/app - retained to avoid tweaking deploy stuff
var app = require("./server/app");
const logger = require("./server/logger");

const Legislators = require("./server/services/CongressLegislators");
const CongressLegislatorSearchUpdater = require("./server/services/CongressLegislatorsSearchUpdater");

(async function startServer() {
  const updater = new CongressLegislatorSearchUpdater(
    Legislators,
    CongressLegislatorSearchUpdater.HTTPAdapter
  );
  await updater.update();

  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
})();
