const logger = require("../logger");
const sentry = require("@sentry/node");
/**
 * In-memory database of legislator data
 */
class CongressLegislatorSearch {
  constructor() {
    this.legislators = {
      /** @type {Object<string, DIO.Legislator[]>} */
      sortedByStates: {},

      /** @type {Object<string, DIO.Legislator>} */
      sortedByID: {}
    };
    this.loaded = false;
  }

  /**
   * finds the state's legislators and the district's reps
   * @param {string} state
   * @param {number} district
   * @returns {DIO.Legislator[]}
   */
  findLegislators(state, district) {
    this.warnLoaded();

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
   * @returns {DIO.Legislator | undefined}
   */
  getLegislatorByID(bioguideID) {
    this.warnLoaded();

    return this.legislators.sortedByID[bioguideID];
  }

  /**
   *
   * @param {string} state
   * @param {number} district
   * @returns {boolean}
   */
  validDistrict(state, district) {
    this.warnLoaded();

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
   * Loads a list of legislators. Replaces any existing legislators.
   * @param {DIO.Legislator[]} legislatorsList
   * @returns {void}
   */
  loadLegislators(legislatorsList) {
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

  /**
   * Clear the legislators. This is mainly for writing tests.
   * @returns {void}
   */
  clearLegislators() {
    this.legislators = {
      sortedByID: {},
      sortedByStates: {}
    };
  }
  warnLoaded() {
    if (this.loaded === false) {
      logger.warn("Legislator data has not been loaded");
      sentry.captureMessage(
        "Legislator data was queried but it was not loaded"
      );
    }
  }
}

module.exports = CongressLegislatorSearch;
