const logger = require("./../../logger");

/**
 * You probably shouldn't use this class directly
 * Stores legislator data in memory
 */
class CongressLegislatorsCache {
  constructor() {
    this.legislators = {
      /** @type {Object<string, Congress.Legislator[]>} */
      sortedByStates: {},

      /** @type {Object<string, Congress.Legislator>} */
      sortedByID: {}
    };
    this.loaded = false;
  }

  /**
   *
   * @param {string} state
   * @param {string} district
   * @returns {Congress.Legislator[]}
   */
  findLegislatorsByDistrict(state, district) {
    if (this.legislators.sortedByStates.hasOwnProperty(state) === false)
      return [];

    return this.legislators.sortedByStates[state].filter(
      legislator =>
        legislator.chamber === "senate" ||
        (legislator.chamber === "house" && legislator.district === district)
    );
  }

  /**
   *
   * @param {string} bioguideID
   * @returns {Congress.Legislator}
   */
  getLegislatorByID(bioguideID) {
    return this.legislators.sortedByID[bioguideID];
  }

  /**
   *
   * @param {string} state
   * @param {string} district
   * @returns {boolean}
   */
  validDistrict(state, district) {
    const stateLegislators = this.legislators.sortedByStates[state];

    // state invalid
    if (!stateLegislators) return false;

    const validators = [
      // valid district
      stateLegislators.some(legislator => legislator.district === district),

      // has reps
      stateLegislators.some(legislator => legislator.chamber === "house"),

      // has senators
      stateLegislators.some(legislator => legislator.chamber === "senate")
    ];

    return validators.every(v => v === true);
  }

  /**
   *
   * @param {Congress.Legislator[]} legislatorsList
   * @returns {void}
   */
  importLegislators(legislatorsList) {
    let nextLegislators = {
      sortedByID: {},
      sortedByStates: {}
    };

    legislatorsList.forEach(function(legislator) {
      let hasState = nextLegislators.sortedByStates.hasOwnProperty(
        legislator.state
      );
      if (!hasState) nextLegislators.sortedByStates[legislator.state] = [];

      nextLegislators.sortedByStates[legislator.state].push(legislator);
      nextLegislators.sortedByID[legislator.bioguideId] = legislator;
    });

    this.legislators = nextLegislators;
    this.loaded = true;
    logger.info("[Congress Legislators] Legislators cached");
  }
}
module.exports = CongressLegislatorsCache;
