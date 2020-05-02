import * as POTC from "./services/PotcAPI";

/**
 * Basic Legislator info
 * Derived from unitedstates/congress-legislators dataset
 */
export interface Legislator {
  bioguideId: string;
  firstName: string;
  lastName: string;
  currentTerm: LegislatorTerm;
}

export type LegislatorTerm =
  | { state: string; chamber: Chamber.House; district: number }
  | { state: string; chamber: Chamber.Senate };

export enum Chamber {
  House = "house",
  Senate = "senate",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Legislator's contact form information
 * This is retrieved from POTC
 */
export interface LegislatorWebForm {
  status: LegislatorWebFormStatus;
  url: string | null;
  topics: { label: string; value: string }[];
}

export enum LegislatorWebFormStatus {
  Ok = "ok",
  /** POTC has been unable to send message to legislator */
  Defunct = "defunct",
  /**
   * Legislator was requested but not found on POTC. This most likely means that the
   * legislator currently does not have a form.
   */
  NotFound = "not_found",
  /**
   * An error occured in our code that would prevent the user from sending the form
   */
  DIOError = "dio_error",
}

export interface LegislatorContact {
  legislator: Legislator;
  form: LegislatorWebForm;
}

////////////////////////////////////////////////////////////////////////////////
export interface Message {
  bioguideId: string;
  subject: string;
  message: string;
  topic: string;
  sender: MessageSender;
  senderAddress: MessageSenderAddress;
  campaign: MessageCampaign;
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

export interface MessageCampaign {
  uuid: string;
  orgURL: string;
  orgName: string;
}

/**
 * Response from POTC
 */
export interface MessageResponse {
  bioguideId: string;
  potcResponse?: POTCFillOutFormResponse;
}

export type POTCFillOutFormResponse = POTC.FillOutFormResponse;
export type POTCCaptcha = POTC.FillOutFormResponseCaptcha;

////////////////////////////////////////////////////////////////////////////////
