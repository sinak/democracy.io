import axios, { AxiosPromise } from "axios";
import {
  MessageSenderAddress,
  Legislator,
  Message,
  MessageResponse
} from "../../server/src/Models";

const API = axios.create({
  baseURL: process.env.API_HOST || "/api/"
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
): ResponsePromise<MessageSenderAddress> {
  return API.get("/location/verify", {
    params: address,
    headers: {
      accept: "application/json"
    }
  });
}

interface CongressionalDistrict {
  state: string;
  district: number;
}

export function getDistrictLegislators(
  congressionalDistrict: CongressionalDistrict
): ResponsePromise<Legislator[]> {
  return API.get("/legislators/findByDistrict", {
    params: congressionalDistrict,
    headers: {
      accept: "application/json"
    }
  });
}

export function sendMessages(
  messages: Message[]
): ResponsePromise<MessageResponse[]> {
  return API.post("/message", messages);
}

export function solveCaptcha(potcCaptcha: { answer: string; uid: string }) {
  return API.post("/captcha-solution", potcCaptcha);
}
