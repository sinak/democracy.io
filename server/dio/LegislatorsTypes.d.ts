declare namespace DIO {
  export type Legislator = Senator | Representative;
  export interface LegislatorBase {
    firstName: string;
    lastName: string;
    bioguideId: string;
    state: string;
  }
  interface Senator extends LegislatorBase {
    chamber: "senate";
    title: "Sen";
    district: null;
  }
  interface Representative extends LegislatorBase {
    chamber: "house";
    title: "Rep";
    district: string;
  }
}
