const fs = require("fs");

/**
 *
 * @param {string} [filePath=congress.json]
 * @returns {Promise<Congress.Legislator[]>}
 */
function LocalFile(filePath = "congress.json") {
  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync(filePath, "utf8");
      resolve(JSON.parse(file));
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.LocalFile = LocalFile;

const Axios = require("axios").default;

const defaultLegislatorsURL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";

/**
 *
 * @param {string} [url=defaultLegislatorsURL]
 * @returns {Promise<Congress.Legislator[]>}
 */
function HTTP(url = defaultLegislatorsURL) {
  return Axios.get(url).then(res => {
    return res.data;
  });
}

module.exports.HTTP = HTTP;
