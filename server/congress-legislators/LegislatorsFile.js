const axios = require("axios").default;

const defaultLegislatorsURL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";

/**
 *
 * @param {string} [url=defaultLegislatorsURL]
 * @returns {Promise<CongressLegislator.Legislator[]>}
 */
module.exports.fetchFile = async (url = defaultLegislatorsURL) => {
  const jsonRes = await axios.get(url);
  return decode(jsonRes.data);
};

/**
 * Decodes legislator data from congress-legislators
 * @param {any[]} parsedJSON
 * @returns {CongressLegislator.Legislator[]}
 */
function decode(parsedJSON) {
  return parsedJSON.map(mapLegislator);
}

// constants
const senTitle = "Sen";
const senChamber = "senate";

const repTitle = "Rep";
const repChamber = "house";

/** @returns {CongressLegislator.Legislator} */
function mapLegislator(legislator) {
  const currentTerm = findLegislatorCurrentTerm(legislator.terms);

  /** @type {CongressLegislator.Legislator} */
  let l;
  if (currentTerm.type === "sen") {
    l = {
      bioguideId: legislator.id.bioguide,
      firstName: legislator.name.first,
      lastName: legislator.name.last,
      title: senTitle,
      chamber: senChamber,
      district: null,
      state: currentTerm.state
    };
  } else if (currentTerm.type === "rep") {
    l = {
      bioguideId: legislator.id.bioguide,
      firstName: legislator.name.first,
      lastName: legislator.name.last,
      title: repTitle,
      chamber: repChamber,
      district: currentTerm.district,
      state: currentTerm.state
    };
  } else {
    throw new Error("Invalid term type");
  }

  return l;
}

/**
 * @typedef Term
 * @property {"rep" | "sen"} type
 * @property {string} start yyyy-mm-dd
 * @property {string} end yyyy-mm-dd
 * @property {string} state state abbreviation
 * @property {number | undefined} district
 */

/**
 *
 * @param {Term[]} terms
 * @returns {Term}
 */
function findLegislatorCurrentTerm(terms) {
  const epochMsTerms = terms.map(t => {
    return {
      ...t,
      start: new Date(t.start).getTime(),
      end: new Date(t.end).getTime()
    };
  });
  const currentTermIndex = epochMsTerms.findIndex(t => t.end > Date.now());
  if (currentTermIndex > -1) {
    return terms[currentTermIndex];
  } else {
    throw new Error("Unable to decode Congress Legislators");
  }
}
