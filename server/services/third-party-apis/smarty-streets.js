/**
 * Helpers for interacting with the Smarty Streets API.
 */

var axios = require("axios").default;
var config = require("config");
var logger = require("./../../logger");

const SmartyStreetsAPI = axios.create({
  baseURL: config.get("SERVER.API.SMARTY_STREETS.ADDRESS_URL"),
  params: {
    "auth-id": config.get("SERVER.CREDENTIALS.SMARTY_STREETS.TOKEN"),
    "auth-token": config.get("SERVER.CREDENTIALS.SMARTY_STREETS.TOKEN")
  }
});

SmartyStreetsAPI.interceptors.request.use(req => {
  logger.http("[Smarty Streets API] [Request]", req);
  return req;
});

SmartyStreetsAPI.interceptors.response.use(res => {
  logger.http("[Smarty Streets API] [Response]", res);
  return res;
});

/**
 *
 * @param {StreetAddressBody} address
 * @returns {Promise<import("axios").AxiosResponse<StreetAddressResult[]>>}
 */
var verifyAddress = function(address) {
  return SmartyStreetsAPI.get("/street-address", {
    params: { street: address }
  });
};

module.exports.verifyAddress = verifyAddress;

/** Types */

/**
 * @typedef StreetAddressBody
 * Each address submitted must have non-blank values for one of the following field combinations to be eligible for a positive address match:
 * - street + city + state
 * - street + zipcode
 * - street (entire address in the street field - what we call a "freeform" input)
 *
 * @property {string} [input_id]
 * @property {string} street
 * @property {string} [street2]
 * @property {string} [secondary]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [zipcode]
 * @property {string} [lastline]
 * @property {string} [addressee]
 * @property {string} [urbanization] Only used with Puerto Rico
 * @property {string} [candidates] The maximum number of valid addresses returned when the input is ambiguous
 * @property {"strict" | "range" | "invalid"} [match]
 */

/**
 * @typedef StreetAddressResult
 * @property {string} input_id
 * @property {number} input_index
 * @property {number} candidate_index
 * @property {string} addressee
 * @property {string} delivery_line_1
 * @property {string} delivery_line_2
 * @property {string} last_line
 * @property {string} delivery_point_barcode
 * @property {StreetAddressResultComponents} components
 * @property {StreetAddressResultMetadata} metadata
 * @property {StreetAddressResultAnalysis} analysis
 */

/**
 * @typedef StreetAddressResultComponents
 * @property {string} [urbanization]
 * @property {string} primary_number
 * @property {string} street_name
 * @property {string} [street_predirection]
 * @property {string} [street_postdirection]
 * @property {string} street_suffix
 * @property {string} [secondary_number]
 * @property {string} [secondary_designator]
 * @property {string} [extra_secondary_number]
 * @property {string} [extra_secondary_designator]
 * @property {string} [pmb_designator]
 * @property {string} city_name
 * @property {string} [default_city_name]
 * @property {string} state_abbreviation
 * @property {string} zipcode
 * @property {string} plus4_code
 * @property {string} delivery_point
 * @property {string} delivery_point_check_digit
 */

/**
 * @typedef StreetAddressResultMetadata
 * @property {"F" | "G" | "H" | "P" | "R" | "S" | "[blank]"} record_type
 * @property {"Unique" | "Military" | "POBox" | "Standard"} zip_type
 * @property {string} county_fips
 * @property {string} county_name
 * @property {string} carrier_route
 * @property {string} congressional_district
 * @property {"Y" | "N"} building_default_indicator
 * @property {"Residential" | "Commercial" | "[blank]"} rdi
 * @property {string} elot_sequence
 * @property {string} elot_sort
 * @property {number} latitude
 * @property {number} longitude
 * @property {"Unknown" | "None" | "State" | "SolutionArea" | "City" | "Zip5" | "Zip6" | "Zip7" | "Zip8" | "Zip9" | "Structure"} precision
 * @property {string} time_zone
 * @property {number} utc_offset
 * @property {string} dst
 */

/**
 * @typedef StreetAddressResultAnalysis
 * @property {"Y" | "N" | "S" | "D" | "[blank]"} dpv_match_code
 * @property {string} dpv_footnotes
 * @property {"Y" | "N" | "[blank]"} dpv_cmra
 * @property {"Y" | "N" | "[blank]"} dpv_vacant
 * @property {"Y" | "N" | "[blank]"} active
 * @property {"true" | "[blank]"} [ews_match]
 * @property {string} footnotes
 * @property {"A" | "00" | "09" | "14" | "92" | "[blank]"} [lacslink_code]
 * @property {"Y" | "S" | "N" | "F" | "[blank]"} [lacslink_indicator]
 * @property {"true" | "false"} [suitelink_match]
 */
