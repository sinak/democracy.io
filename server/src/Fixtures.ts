/**
 * Fixtures for tests
 */
import {
  MessageSenderAddress,
  Legislator,
  LegislatorContact,
  LegislatorWebFormStatus
} from "./models";
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

export function legislatorFixture(
  partialLegislator?: Partial<Legislator>
): Legislator {
  return {
    bioguideId: "",
    currentTerm: {
      chamber: "house",
      district: 0
    },
    firstName: "",
    lastName: "",
    state: "",
    ...partialLegislator
  };
}

export function legislatorContactFixture(
  partialLegislatorContact?: Partial<LegislatorContact>
): LegislatorContact {
  return {
    bioguideId: "",
    currentTerm: {
      chamber: "house",
      district: 0
    },
    firstName: "",
    lastName: "",
    state: "",
    form: {
      status: LegislatorWebFormStatus.Ok,
      formElements: [],
      url: ""
    },
    ...partialLegislatorContact
  };
}

export function axiosResponseFixture<T = any>(
  partialAxiosResponse?: Partial<AxiosResponse<T>>
): AxiosResponse<T> {
  let data: any = {};
  if (partialAxiosResponse && partialAxiosResponse.data) {
    data = partialAxiosResponse.data;
  }
  return {
    config: {},
    data: data,
    headers: {},
    request: {},
    status: 0,
    statusText: "",
    ...partialAxiosResponse
  };
}
