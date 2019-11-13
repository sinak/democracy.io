import axios, { AxiosPromise } from "axios";
import {
  CanonicalAddress,
  Legislator,
  Message,
  MessageResponse
} from "../../server/Models";

const API = axios.create({
  baseURL: process.env.API_HOST || "/api/1/"
});

/**
 * The data in JSON responses are wrapped
 * eg:
 *
 * ```json
 * {
 *   "status": "success",
 *   "data": [{ "foo": "bar" }]
 * }
 * ```
 */
interface DIOResWrapper<T> {
  status: "success";
  data: T;
}
type ResponsePromise<T> = AxiosPromise<DIOResWrapper<T>>;

interface UnverifiedAddress {
  streetAddress: string;
  zipCode: string;
  city: string;
}

export function verifyAddress(
  address: UnverifiedAddress
): ResponsePromise<CanonicalAddress[]> {
  return API.get("/location/verify", {
    params: {
      address: `${address.streetAddress} ${address.city} ${address.zipCode}`
    },
    headers: {
      accept: "application/json"
    }
  });
}

interface CongressionalDistrict {
  state: string;
  district: string;
}

export function getDistrictLegislators(
  congressionalDistrict: CongressionalDistrict
): ResponsePromise<Legislator[]> {
  return API.get("/legislators/findByDistrict", {
    params: {
      ...congressionalDistrict
    }
  });
}

export function sendMessages(
  messages: Message[]
): ResponsePromise<MessageResponse[]> {
  return API.post("/message", messages);
}
