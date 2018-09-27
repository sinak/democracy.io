/**
 * Helpers for interacting with the Phantom of the Capitol API.
 */

var axios = require("axios").default;
var config = require("config");
const ServiceLogger = require("./ServiceLogger");

const POTCApi = axios.create({
  baseURL: config.get("SERVER.API.POTC_BASE_URL"),
  params: {
    debug_key: config.get("SERVER.CREDENTIALS.POTC.DEBUG_KEY")
  }
});

POTCApi.interceptors.response.use(
  ServiceLogger.createResponseInterceptor("POTC API"),
  ServiceLogger.createErrorInterceptor("POTC API")
);

/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 * @param {string[]} bioguideIds
 * @returns {Promise<import("axios").AxiosResponse<POTC.FormElementsResult>>}
 */
var getFormElementsForRepIdsFromPOTC = function(bioguideIds) {
  return POTCApi.post("/retrieve-form-elements", {
    bio_ids: bioguideIds
  });
};

/**
 * Sends a message to a representative via POTC.
 * @param {POTC.FillOutForm.Request} message
 * @returns {Promise<import("axios").AxiosResponse<POTC.FillOutForm.Response>>}
 */
var sendMessage = function(message) {
  return POTCApi.post("/fill-out-form", message);
};

/**
 * @typedef FillOutCaptchaBody
 * @property {string} answer
 * @property {string} uid
 */

/**
 * @typedef FillOutCaptchaResponse
 * @property {"success" | "error"} status
 */

/**
 * Sends a captcha solution to POTC.
 * @param {FillOutCaptchaBody} solution
 * @returns {Promise<import("axios").AxiosResponse<FillOutCaptchaResponse>>}
 */
var solveCaptcha = function(solution) {
  return POTCApi.post("/fill-out-captcha", solution);
};

module.exports.getFormElementsForRepIdsFromPOTC = getFormElementsForRepIdsFromPOTC;
module.exports.sendMessage = sendMessage;
module.exports.solveCaptcha = solveCaptcha;
