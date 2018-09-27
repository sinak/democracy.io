/**
 * Helpers for working with the EFF Civic CRM APIs.
 */

var axios = require("axios").default;
var config = require("config");
var qs = require("querystring");
var ServiceLogger = require("./ServiceLogger");

const EFFCivicCRM = axios.create({
  baseURL: config.get("SERVER.API.EFF_CIVIC_CRM_URL"),
  params: {
    site_key: config.get("SERVER.CREDENTIALS.EFF_CIVIC_CRM.SITE_KEY")
  }
});

EFFCivicCRM.interceptors.response.use(
  ServiceLogger.createResponseInterceptor("POTC API"),
  ServiceLogger.createErrorInterceptor("POTC API")
);

/**
 * @param {object} params
 * @param {object} params.contact_params
 * @param {string} params.contact_params.email
 * @param {string} params.contact_params.first_name
 * @param {string} params.contact_params.last_name
 * @param {string} params.contact_params.source
 * @param {boolean} params.contact_params.subscribe
 * @param {object} params.address_params
 * @param {string} params.address_params.street
 * @param {string} params.address_params.city
 * @param {string} params.address_params.state
 * @param {string} params.address_params.zip
 * @param {string} params.address_params.country
 */
var subscribeToEFFMailingList = function(params) {
  // To use the EFF Civic CRM API, you send it a POST request, that request must contain:
  //   * The action method to call, in our case import_contact
  //   * The site_key to auth the request
  //   * A JSON string containing details of the person to subscribe

  const formData = {
    method: "import_contact",
    data: JSON.stringify(params)
  };

  return EFFCivicCRM.post("/civicrm/eff-action-api", qs.stringify(formData));
};

module.exports.subscribeToEFFMailingList = subscribeToEFFMailingList;
