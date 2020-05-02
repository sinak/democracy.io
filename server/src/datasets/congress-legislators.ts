import axios from "axios";
import * as CongressLegislators from "./congress-legislators-types";
import {
  Legislator as DIOLegislator,
  LegislatorTerm,
  Chamber,
} from "../models";

const defaultLegislatorsURL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";

/**
 * fetches the file and maps fields to our Legislator interface
 */
export async function fetch(
  url = defaultLegislatorsURL
): Promise<DIOLegislator[]> {
  const jsonRes = await axios.get<CongressLegislators.Legislator[]>(url);

  return jsonRes.data.map((clLegislator) => {
    const currentTerm = findLegislatorCurrentTerm(clLegislator.terms);

    return {
      bioguideId: clLegislator.id.bioguide,
      firstName: clLegislator.name.first,
      lastName: clLegislator.name.last,
      currentTerm:
        currentTerm.type === "sen"
          ? { chamber: Chamber.Senate, state: currentTerm.state }
          : {
              chamber: Chamber.House,
              district: currentTerm.district!,
              state: currentTerm.state,
            },
    };
  });
}

function findLegislatorCurrentTerm(terms: CongressLegislators.Term[]) {
  const epochMsTerms = terms.map((t) => {
    return {
      ...t,
      start: new Date(t.start).getTime(),
      end: new Date(t.end).getTime(),
    };
  });
  const currentTermIndex = epochMsTerms.findIndex((t) => t.end > Date.now());
  if (currentTermIndex > -1) {
    return terms[currentTermIndex];
  } else {
    throw new Error("Unable to decode Congress Legislators");
  }
}
