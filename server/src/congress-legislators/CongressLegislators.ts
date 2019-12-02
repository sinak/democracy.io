export type Legislator = Senator | Representative;

export interface LegislatorBase {
  firstName: string;
  lastName: string;
  bioguideId: string;
  state: string;
}

export interface Senator extends LegislatorBase {
  chamber: "senate";
  district: null;
}

export interface Representative extends LegislatorBase {
  chamber: "house";
  district: number;
}

//////////////////
export interface CongressLegislator {
  id: {
    bioguide: string;
    thomas: string;
    lis: string;
    govtrack: number;
    opensecrets: string;
    votesmart: number;
    fec: string[];
    cspan: string;
    wikipedia: string;
    house_history: number;
    ballotpedia: string;
    maplight: number;
    icpsr: number;
    wikidata: string;
    google_entity_id: string;
  };
  name: {
    first: string;
    middle?: string;
    last: string;
    official_full: string;
    nickname?: string;
    suffix?: string;
  };
  bio: {
    birthday: string;
    gender: string;
  };
  terms: {};
}

interface TermBase {
  start: string;
  end: string;
  state: string;
  class?: number;
  party: string;
  address?: string;
  phone?: string;
  fax?: string;
  contact_form?: string;
  office?: string;
  state_rank?: string;
}
