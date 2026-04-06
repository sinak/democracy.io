import { logger } from '../logger.js';
import type { Legislator } from '../types.js';

export class LegislatorSearch {
  private byState: Record<string, Legislator[]> = {};
  private byId: Record<string, Legislator> = {};
  loaded = false;

  findLegislators(state: string, district: number | string): Legislator[] {
    this.warnIfNotLoaded();
    const stateLegislators = this.byState[state];
    if (!stateLegislators) return [];

    const districtNum = typeof district === 'string' ? parseInt(district, 10) : district;
    return stateLegislators.filter(
      (l) => l.chamber === 'senate' || (l.chamber === 'house' && l.district === districtNum)
    );
  }

  getLegislatorByID(bioguideId: string): Legislator | undefined {
    this.warnIfNotLoaded();
    return this.byId[bioguideId];
  }

  validDistrict(state: string, district: number | string): boolean {
    this.warnIfNotLoaded();
    const stateLegislators = this.byState[state];
    if (!stateLegislators) return false;

    const districtNum = typeof district === 'string' ? parseInt(district, 10) : district;
    return (
      stateLegislators.some((l) => l.district === districtNum) &&
      stateLegislators.some((l) => l.chamber === 'house') &&
      stateLegislators.some((l) => l.chamber === 'senate')
    );
  }

  loadLegislators(list: Legislator[]) {
    const nextByState: Record<string, Legislator[]> = {};
    const nextById: Record<string, Legislator> = {};

    for (const l of list) {
      if (!nextByState[l.state]) nextByState[l.state] = [];
      nextByState[l.state].push(l);
      nextById[l.bioguideId] = l;
    }

    this.byState = nextByState;
    this.byId = nextById;
    this.loaded = true;
    logger.info('[Congress Legislators] Legislators cached');
  }

  private warnIfNotLoaded() {
    if (!this.loaded) {
      logger.warn('Legislator data has not been loaded');
    }
  }
}

// Singleton instance
export const legislators = new LegislatorSearch();
