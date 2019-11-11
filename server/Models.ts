export interface Message {
  bioguideId: string;
  subject: string;
  message: string;
  topic: string;

  sender: MessageSender;
  canonicalAddress: CanonicalAddress;
  campaign: Campaign;
}
interface MessageSender {
  namePrefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  parenPhone: string;
  email: string;
  county: string;
}

export interface CanonicalAddress {
  address: string;
  county: string;
  district: string;
  components: AddressComponents;
}
interface AddressComponents {
  primaryNumber: SmartyStreets.USStreetAPI.Components["primary_number"];
  streetName: SmartyStreets.USStreetAPI.Components["street_name"];
  streetPredirection: SmartyStreets.USStreetAPI.Components["street_predirection"];
  streetPostdirection: SmartyStreets.USStreetAPI.Components["street_postdirection"];
  streetSuffix: SmartyStreets.USStreetAPI.Components["street_suffix"];
  secondaryNumber: SmartyStreets.USStreetAPI.Components["secondary_number"];
  cityName: SmartyStreets.USStreetAPI.Components["city_name"];
  defaultCityName: SmartyStreets.USStreetAPI.Components["default_city_name"];
  stateAbbreviation: SmartyStreets.USStreetAPI.Components["state_abbreviation"];
  zipcode: SmartyStreets.USStreetAPI.Components["zipcode"];
  plus4Code: SmartyStreets.USStreetAPI.Components["plus4_code"];
}
export interface Campaign {
  uuid: string;
  orgURL: string;
  orgName: string;
}

import * as CongressLegislator from "./congress-legislators/CongressLegislators";
export interface Legislator {
  bioguideId: CongressLegislator.Legislator["bioguideId"];
  title: CongressLegislator.Legislator["title"];
  firstName: CongressLegislator.Legislator["firstName"];
  lastName: CongressLegislator.Legislator["lastName"];
  state: CongressLegislator.Legislator["state"];
  district: CongressLegislator.Legislator["district"];
  chamber: CongressLegislator.Legislator["chamber"];
  formStatus: "ok" | "defunct" | "coming_soon";
  contactURL: POTC.FormElementsResult[0]["contact_url"];
  formElements: LegislatorFormElement[];
}

export interface LegislatorFormElement {
  value: POTC.FormElementsResult[0]["required_actions"][0]["value"];
  maxLength: POTC.FormElementsResult[0]["required_actions"][0]["maxlength"];
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
