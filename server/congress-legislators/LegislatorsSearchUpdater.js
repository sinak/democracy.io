const logger = require("../logger");
const fs = require("fs");
const sentry = require("@sentry/node");

/**
 * Congress Legislators updater
 * @example
 * const search = new CongressLegislatorsSearch();
 * const updater = new CongressLegislatorSearchUpdater(search, () => {
 *   return axios.get("someurl.json").then(res => res.data)
 * })
 *
 * // update immediately, then schedule to run every minute
 * updater
 *   .update()
 *   .then(() => updater.schedule(60 * 1000));
 */
class CongressLegislatorSearchUpdater {
  /**
   * @param {import("./LegislatorsSearch")} searchInstance
   * @param {(...args: any[]) => Promise<CongressLegislator.Legislator[]>} adapter Any function that resolves to an array of legislators.
   */
  constructor(searchInstance, adapter) {
    this.adapter = adapter;
    this.storageInstance = searchInstance;
  }
  /**
   * Update the legislator storage
   * @returns {Promise}
   */
  async update() {
    const legislators = await this.adapter();
    this.storageInstance.loadLegislators(legislators);

    return;
  }
  /**
   * Update the legislator storage every X milliseconds
   * @param {number} intervalMilliseconds
   * @returns {NodeJS.Timer}
   */
  schedule(intervalMilliseconds) {
    let updater = setInterval(async () => {
      logger.info("[Congress Legislators] Automatic update");

      try {
        await this.update();
      } catch (e) {
        logger.error("[Congress Legislators] Automatic update failed", e);
        sentry.captureException(e);

        // TODO: handle errors
        // should this be retried? should it clear the interval?
      }
    }, intervalMilliseconds);

    return updater;
  }
}

module.exports = CongressLegislatorSearchUpdater;

/**
 *
 * @param {string} [filePath=congress.json]
 * @returns {Promise<CongressLegislator.Legislator[]>}
 */
function FileAdapter(filePath = "congress.json") {
  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync(filePath, "utf8");
      resolve(JSON.parse(file));
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.FileAdapter = FileAdapter;
