// @ts-check
/**
 * Verifies an address via SmartyStreets.
 */

import { Router } from "express";
import * as SmartyStreetsAPI from "../services/SmartyStreetsAPI";
import { MessageSenderAddress } from "../models";

const expressRouter = Router();
expressRouter.get("/location/verify", async (req, res) => {
  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned from the API call.

  let addressQuery = [
    req.query.streetAddress,
    req.query.city,
    req.query.zipCode
  ].join(" ");

  let verifyAddressRes;
  try {
    verifyAddressRes = await SmartyStreetsAPI.verifyAddress(addressQuery);
  } catch (err) {
    return res.status(504).json({
      error: "Request failed"
    });
  }

  // no addresses found
  if (verifyAddressRes.data.length === 0) {
    return res.status(400).json({
      status: "error",
      message:
        "Your address was not recognized. Please check the address and try again."
    });
  }

  let ssCandidate = verifyAddressRes.data[0];

  const messageSenderAddress: MessageSenderAddress = {
    // TODO: add error handling for undefined fields
    city: ssCandidate.components.city_name || "",
    zip4: ssCandidate.components.plus4_code || "",
    zip5: ssCandidate.components.zipcode || "",
    zipPlus4: `${ssCandidate.components.zipcode}-${ssCandidate.components.plus4_code}`,
    county: ssCandidate.metadata.county_name,
    // district's are stored as ints everywhere else, SS uses strings
    district: districtStringToInt(ssCandidate.metadata.congressional_district),
    stateFull: states[ssCandidate.components.state_abbreviation],
    statePostalAbbrev: ssCandidate.components.state_abbreviation,
    streetAddress: ssCandidate.delivery_line_1,
    streetAddress2: null
  };

  res.json(messageSenderAddress);
});

export default expressRouter;

/**
 *
 * @param {string} smartyStreetsDistrict
 * @returns {number}
 */
function districtStringToInt(smartyStreetsDistrict: string) {
  if (smartyStreetsDistrict === "AL") return 0;
  return parseInt(smartyStreetsDistrict);
}

/** @type {{[key: string]: string}} */
const states: { [key: string]: string } = {
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FM: "Federated States Of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming"
};
