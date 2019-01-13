/**
 * Smarty Streets API Client
 *
 * Only the /street-address endpoint is implemented
 */

var axios = require("axios").default;
var config = require("config");
var ServiceLogger = require("./ServiceLogger");

const SmartyStreetsAPI = axios.create({
  baseURL: config.get("SERVER.API.SMARTY_STREETS.ADDRESS_URL"),
  params: {
    "auth-id": config.get("SERVER.CREDENTIALS.SMARTY_STREETS.TOKEN"),
    "auth-token": config.get("SERVER.CREDENTIALS.SMARTY_STREETS.TOKEN")
  }
});

SmartyStreetsAPI.interceptors.response.use(
  ServiceLogger.createResponseInterceptor("Smarty Streets"),
  ServiceLogger.createErrorInterceptor("Smarty Streets")
);

/**
 * @template T
 * @typedef {import("axios").AxiosPromise<T>} AxiosPromise
 */

/**
 *
 * @param {SmartyStreets.StreetAddress.Body} address
 * @returns {AxiosPromise<SmartyStreets.StreetAddress.Result[]>}
 */
var verifyAddress = function(address) {
  return SmartyStreetsAPI.get("/street-address", {
    params: { street: address }
  });
};

module.exports.verifyAddress = verifyAddress;
