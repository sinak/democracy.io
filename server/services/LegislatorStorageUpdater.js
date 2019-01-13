const logger = require("../logger");
const fs = require("fs");

class LegislatorStorageUpdater {
  /**
   * @param {import("./LegislatorStorage")} storageInstance
   * @param {(url?: string) => Promise<Congress.Legislator[]>} adapter
   */
  constructor(storageInstance, adapter) {
    this.adapter = adapter;
    this.storageInstance = storageInstance;
  }
  /**
   * Update the legislator storage
   * @returns {Promise<>}
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
    let updater = setInterval(() => {
      logger.info("[Congress Legislators] Automatic update");

      this.update().catch(e => {
        logger.error("[Congress Legislators] Automatic update failed", e);

        // TODO: handle errors
        // clearInterval(updater);
      });
    }, intervalMilliseconds);

    return updater;
  }
}

module.exports = LegislatorStorageUpdater;

/**
 *
 * @param {string} [filePath=congress.json]
 * @returns {Promise<Congress.Legislator[]>}
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

const Axios = require("axios").default;

const defaultLegislatorsURL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";

/**
 *
 * @param {string} [url=defaultLegislatorsURL]
 * @returns {Promise<Congress.Legislator[]>}
 */
function HTTPAdapter(url = defaultLegislatorsURL) {
  return Axios.get(url).then(res => {
    return res.data;
  });
}

module.exports.HTTPAdapter = HTTPAdapter;
