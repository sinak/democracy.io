// @ts-check
/**
 * Helpers for interacting with the Phantom of the Capitol API.
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

/////////////////////////////////////////////////////////////////

/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 */
export function getFormElements(
  bioguideIds: string[]
): AxiosPromise<RetrieveFormElementsResponse> {
  return POTCApi.post("/retrieve-form-elements", {
    bio_ids: bioguideIds
  });
}

export interface RetrieveFormElementsResponse {
  [key: string]: LegislatorFormElements;
}

export interface LegislatorFormElements {
  required_actions: {
    maxlength: number | null;
    value: string;
    options_hash: {
      [key: string]: string;
    };
  }[];
  defunct: boolean | null;
  contact_url: string | null;
}

/////////////////////////////////////////////////////////////////

/**
 * Sends a message to a representative via POTC.
 */
export function sendMessage(
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

export interface FillOutFormResponseNoCaptcha {
  status: "success" | "error";
}
export interface FillOutFormResponseHasCaptcha {
  status: "captcha_needed";
  url: string;
}

export type FillOutFormResponse =
  | FillOutFormResponseHasCaptcha
  | FillOutFormResponseNoCaptcha;

///////////////////////////////////////////////////////////////////

/**
 * Sends a captcha solution to POTC.
 */
export function solveCaptcha(
  solution: FillOutCaptchaRequest
): AxiosPromise<FillOutCaptchaResponse> {
  return POTCApi.post("/fill-out-captcha", solution);
}

export interface FillOutCaptchaRequest {
  answer: string;
  uid: string;
}

export interface FillOutCaptchaResponse {
  status: "success" | "error";
}
