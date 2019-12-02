import axios from "axios";
import * as CongressLegislators from "./CongressLegislators";
import { Legislator as DIOLegislator } from "./../Models";

const defaultLegislatorsURL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";

/**
 *
 * @param {string} [url=defaultLegislatorsURL]
 * @returns {Promise<CongressLegislator.Legislator[]>}
 */
module.exports.fetchFile = async (url: string = defaultLegislatorsURL) => {
  const jsonRes = await axios.get(url);
  return decode(jsonRes.data);
};

export async function fetchFile(
  url = defaultLegislatorsURL
): Promise<CongressLegislators.Legislator[]> {
  const jsonRes = await axios.get(url);
  return decode(jsonRes.data);
}

/**
 * Decodes legislator data from congress-legislators
 */
function decode(parsedJSON: CongressLegislators.Legislator[]): DIOLegislator[] {
  return parsedJSON.map(mapLegislator);
}

// constants
const senTitle = "Sen";
const senChamber = "senate";

const repTitle = "Rep";
const repChamber = "house";

function mapLegislator(
  legislator: CongressLegislators.Legislator
): CongressLegislators.Legislator[] {
  const currentTerm = findLegislatorCurrentTerm(legislator.terms);

  /** @type {import("./CongressLegislators").Legislator} */
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

interface Term {
  type: "rep" | "sen";
  start: string;
  end: string;
  state: string;
  district?: number;
}

function findLegislatorCurrentTerm(terms: Term[]) {
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
