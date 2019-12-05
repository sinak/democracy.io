// TODO: this might be an unneccessary abstraction. we could just move this
// into a simple function with setInterval
import logger from "./../logger";
import * as fs from "fs";
import * as sentry from "@sentry/node";
import LegislatorsSearch from "./LegislatorsSearch";
import * as Models from "./../models";

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
export default class CongressLegislatorSearchUpdater {
  storageInstance: LegislatorsSearch;
  adapter: (...args: any[]) => Promise<Models.Legislator[]>;
  constructor(
    searchInstance: LegislatorsSearch,
    adapter: (...args: any[]) => Promise<Models.Legislator[]>
  ) {
    this.adapter = adapter;
    this.storageInstance = searchInstance;
  }
  /**
   * Update the legislator storage
   */
  async update(): Promise<any> {
    const legislators = await this.adapter();
    this.storageInstance.loadLegislators(legislators);

    return;
  }
  /**
   * Update the legislator storage every X milliseconds
   */
  schedule(intervalMilliseconds: number): NodeJS.Timer {
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

/**
 *
 * @param {string} [filePath=congress.json]
 * @returns {Promise<CongressLegislator.Legislator[]>}
 */
export function FileAdapter(filePath = "congress.json") {
  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync(filePath, "utf8");
      resolve(JSON.parse(file));
    } catch (e) {
      reject(e);
    }
  });
}
