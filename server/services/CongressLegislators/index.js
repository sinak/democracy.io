const CongressLegislatorsCache = require("./CongressLegislatorsCache");
const DataFetchers = require("./DataFetchers");
const logger = require("./../../logger");

function autoupdateCache() {
  const congressCache = new CongressLegislatorsCache();

  const fetcher = () => {
    return DataFetchers.LocalFile().then(legislators => {
      congressCache.importLegislators(legislators);
    });
  };

  const automaticUpdate = () => {
    let updater = setInterval(() => {
      logger.info("[Congress Legislators] Automatic update");
      fetcher().catch(e => {
        logger.error("[Congress Legislators] Automatic update failed", e);
        clearInterval(updater);
      });
    }, 200000);
  };

  // initialize and update every X ms
  fetcher()
    .then(automaticUpdate)
    .catch(e => {
      logger.error("[Congress Legislators] Initial update failed", e);
    });

  return congressCache;
}

module.exports = (() => autoupdateCache())();
