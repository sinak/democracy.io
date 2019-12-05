import * as Models from "./../models";

/**
 * In-memory database of legislator data
 */
export default class LegislatorSearch {
  legislatorsSortedByState: {
    [stateAbbrev: string]: Models.Legislator[];
  };
  legislatorsSortedByID: {
    [bioguideID: string]: Models.Legislator;
  };
  loaded: boolean;

  constructor() {
    this.legislatorsSortedByState = {};
    this.legislatorsSortedByID = {};
    this.loaded = false;
  }

  /**
   * finds the state's legislators and the district's reps
   */
  findLegislators(state: string, district: number): Models.Legislator[] {
    if (this.legislatorsSortedByState.hasOwnProperty(state) === false)
      return [];

    return this.legislatorsSortedByState[state].filter(legislator => {
      return (
        legislator.currentTerm.chamber === "senate" ||
        (legislator.currentTerm.chamber === "house" &&
          legislator.currentTerm.district === district)
      );
    });
  }

  getLegislatorByID(bioguideID: string): Models.Legislator | undefined {
    return this.legislatorsSortedByID[bioguideID];
  }

  /**
   * Loads a list of legislators. Replaces any existing legislators.
   */
  loadLegislators(legislatorsList: Models.Legislator[]): void {
    let nextLegislatorsSortedByState: {
      [stateAbbrev: string]: Models.Legislator[];
    } = {};

    let nextLegislatorsSortedByID: {
      [bioguideId: string]: Models.Legislator;
    } = {};

    legislatorsList.forEach(function(legislator) {
      let hasState = legislator.state in nextLegislatorsSortedByState;
      if (!hasState) nextLegislatorsSortedByState[legislator.state] = [];

      nextLegislatorsSortedByState[legislator.state].push(legislator);

      nextLegislatorsSortedByID[legislator.bioguideId] = legislator;
    });

    this.legislatorsSortedByState = nextLegislatorsSortedByState;
    this.legislatorsSortedByID = nextLegislatorsSortedByID;
  }

  /**
   * Clear the legislators. This is mainly for writing tests.
   */
  clearLegislators() {
    this.legislatorsSortedByID = {};
    this.legislatorsSortedByState = {};
  }
}
