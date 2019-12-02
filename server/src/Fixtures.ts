import {
  MessageSenderAddress,
  Legislator,
  LegislatorBase,
  LegislatorRep,
  LegislatorSenator
} from "./Models";
import { AxiosResponse } from "axios";

export function messageSenderAddressFixture(
  partialMessageSenderAddress?: Partial<MessageSenderAddress>
): MessageSenderAddress {
  return {
    city: "",
    county: "",
    district: 0,
    stateFull: "",
    statePostalAbbrev: "",
    streetAddress: "",
    streetAddress2: "",
    zip4: "",
    zip5: "",
    zipPlus4: "",
    ...partialMessageSenderAddress
  };
}

const baseLegislatorDefaults: LegislatorBase = {
  bioguideId: "",
  contactURL: "",
  firstName: "",
  formElements: [],
  formStatus: "ok",
  lastName: "",
  state: ""
};
export function legislatorRepFixture(
  partialRep?: Partial<LegislatorRep>
): LegislatorRep {
  return {
    ...baseLegislatorDefaults,
    district: 0,
    ...partialRep,
    chamber: "house"
  };
}

export function legislatorSenatorFixture(
  partialSenator?: Partial<LegislatorSenator>
): LegislatorSenator {
  return {
    ...baseLegislatorDefaults,
    ...partialSenator,
    chamber: "senate",
    district: null
  };
}

export function axiosResponseFixture(
  partialAxiosResponse?: Partial<AxiosResponse>
): AxiosResponse {
  return {
    config: {},
    data: {},
    headers: {},
    request: {},
    status: 0,
    statusText: "",
    ...partialAxiosResponse
  };
}
