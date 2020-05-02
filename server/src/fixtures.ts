/**
 * Fixtures for tests
 */
import {
  MessageSenderAddress,
  Legislator,
  LegislatorContact,
  LegislatorWebFormStatus,
  Chamber,
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
    ...partialMessageSenderAddress,
  };
}

export function legislatorFixture(
  partialLegislator?: Partial<Legislator>
): Legislator {
  return {
    bioguideId: "",
    currentTerm: {
      state: "",
      chamber: Chamber.House,
      district: 0,
    },
    firstName: "",
    lastName: "",
    ...partialLegislator,
  };
}

export function legislatorContactFixture(
  partialLegislatorContact?: Partial<LegislatorContact>
): LegislatorContact {
  return {
    legislator: legislatorFixture(),
    form: {
      status: LegislatorWebFormStatus.Ok,
      topics: [
        { label: "Agriculture", value: "Agr" },
        { label: "Budget", value: "BUD" },
      ],
      url: "",
    },
    ...partialLegislatorContact,
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
    ...partialAxiosResponse,
  };
}
