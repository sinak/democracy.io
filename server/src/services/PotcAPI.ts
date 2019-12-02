/**
 * Phantom of the Capitol API.
 * https://github.com/EFForg/phantom-of-the-capitol
 * https://github.com/EFForg/phantom-of-the-capitol/blob/master/app/views/index.md
 */
import axios, { AxiosPromise } from "axios";
import Config from "./../config";
import * as ServiceLogger from "./ServiceLogger";

const POTCApi = axios.create({
  baseURL: Config.POTC_BASE_URL,
  params: {
    debug_key: Config.POTC_DEBUG_KEY
  }
});

POTCApi.interceptors.response.use(
  ServiceLogger.createResponseInterceptor("POTC API"),
  ServiceLogger.createErrorInterceptor("POTC API")
);

////////////////////////////////////////////////////////////////////////////////
/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 */
export function retrieveFormElements(
  bioguideIds: string[]
): AxiosPromise<RetrieveFormElementsResponse> {
  return POTCApi.post("/retrieve-form-elements", {
    bio_ids: bioguideIds
  });
}

export interface RetrieveFormElementsResponse {
  [bioguideId: string]: {
    required_actions: {
      maxlength: number | null;
      value: string;
      options_hash: {
        [key: string]: string;
      };
    }[];
    defunct: boolean | null;
    contact_url: string | null;
  };
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Sends a message to a representative via POTC.
 * @returns {AxiosPromise<POTC.FillOutForm.Response>}
 */
export function fillOutForm(
  message: FillOutFormRequest
): AxiosPromise<FillOutFormResponse> {
  return POTCApi.post("/fill-out-form", message);
}

export interface FillOutFormRequest {
  bio_id: string;
  campaign_tag: string;
  fields: {
    [key: string]: any;
  };
}

export type FillOutFormResponse =
  | FillOutFormResponseNoCaptcha
  | FillOutFormResponseCaptcha;

export interface FillOutFormResponseNoCaptcha {
  status: "success" | "error";
}

export interface FillOutFormResponseCaptcha {
  status: "captcha_needed";
  url: string;
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Sends a captcha solution to POTC.
 */
export function fillOutCaptcha(
  solution: FillOutCaptchaBody
): AxiosPromise<FillOutCaptchaResponse> {
  return POTCApi.post("/fill-out-captcha", solution);
}

export interface FillOutCaptchaBody {
  answer: string;
  uid: string;
}

export interface FillOutCaptchaResponse {
  status: "success" | "error";
}
////////////////////////////////////////////////////////////////////////////////
