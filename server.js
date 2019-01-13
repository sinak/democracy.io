// Passes through to server/app - retained to avoid tweaking deploy stuff
var app = require("./server/app");
const logger = require("./server/logger");

const Legislators = require("./server/services/Legislators");
const LegislatorStorageUpdater = require("./server/services/LegislatorStorageUpdater");

async function startServer() {
  const updater = new LegislatorStorageUpdater(
    Legislators,
    LegislatorStorageUpdater.HTTPAdapter
  );
  await updater.update();
  updater.schedule(120000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
}
