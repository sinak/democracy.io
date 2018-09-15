/**
 * Helpers for interacting with the Phantom of the Capitol API.
 */

var axios = require("axios").default;
var config = require("config");
const logger = require("./../../logger");

const POTCApi = axios.create({
  baseURL: config.get("SERVER.API.POTC_BASE_URL"),
  params: {
    debug_key: config.get("SERVER.CREDENTIALS.POTC.DEBUG_KEY")
  }
});

POTCApi.interceptors.request.use(req => {
  logger.http("[POTC API] [Request]", req);
  return req;
});

POTCApi.interceptors.response.use(res => {
  logger.http("[POTC API] [Response]", res);
  return res;
});

/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 * @param {string[]} bioguideIds
 * @returns {Promise<import("axios").AxiosResponse<import("./potc-types").POTC.FormElementsRes>>}
 */
var getFormElementsForRepIdsFromPOTC = function(bioguideIds) {
  return POTCApi.post("/retrieve-form-elements", {
    bio_ids: bioguideIds
  });
};

/**
 * @typedef FillOutFormRequest
 * @property {string} bio_id
 * @property {string} campaign_tag
 * @property {object} fields
 */
/**
 * @typedef FillOutFormResponse
 * @property {"success" | "error"} status
 */
/**
 * @typedef FillOutFormCaptchaNeededResponse
 * @property {"captcha_needed"} status
 * @property {string} url
 */

/**
 * Sends a message to a representative via POTC.
 * @param {FillOutFormRequest} message
 * @returns {Promise<import("axios").AxiosResponse<FillOutFormResponse | FillOutFormCaptchaNeededResponse>>}
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
