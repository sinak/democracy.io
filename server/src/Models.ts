import * as POTC from "./services/PotcAPI";

export interface Message {
  bioguideId: string;
  subject: string;
  message: string;
  topic: string;

  sender: MessageSender;
  senderAddress: MessageSenderAddress;
  campaign: Campaign;
}

export interface MessageSender {
  namePrefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  parenPhone: string;
  email: string;
}

/**
 * Address fields used by Contact Congress
 */
export interface MessageSenderAddress {
  streetAddress: string;
  streetAddress2: string | null;
  city: string;
  district: number;
  statePostalAbbrev: string;
  stateFull: string;
  county: string;
  zip5: string;
  zip4: string;
  zipPlus4: string;
}
export interface Campaign {
  uuid: string;
  orgURL: string;
  orgName: string;
}

import * as CongressLegislator from "./congress-legislators/CongressLegislators";

export interface LegislatorRep extends LegislatorBase {
  chamber: "house";
  district: number;
}

export interface LegislatorSenator extends LegislatorBase {
  chamber: "senate";
  district: null;
}

export interface LegislatorBase {
  bioguideId: CongressLegislator.Legislator["bioguideId"];
  firstName: CongressLegislator.Legislator["firstName"];
  lastName: CongressLegislator.Legislator["lastName"];
  state: CongressLegislator.Legislator["state"];
  formStatus: "ok" | "defunct" | "coming_soon";
  contactURL: POTC.RetrieveFormElementsResponse[0]["contact_url"];
  formElements: LegislatorFormElement[];
}

export type Legislator = LegislatorRep | LegislatorSenator;

export interface LegislatorFormElement {
  value: POTC.RetrieveFormElementsResponse[0]["required_actions"][0]["value"];
  maxLength: POTC.RetrieveFormElementsResponse[0]["required_actions"][0]["maxlength"];
  optionsHash:
    | {
        [key: string]: any;
      }
    | string[]
    | null;
}

export interface MessageResponse {
  bioguideId: string;
  status: string;
  url: string;
  uid: string;
}
