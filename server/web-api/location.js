// @ts-check
/**
 * Verifies an address via SmartyStreets.
 */

const expressRouter = require("express").Router();
const resHelpers = require("./helpers/response");
const SmartyStreetsAPI = require("./../services/SmartyStreetsAPI");
const _ = require("lodash");

expressRouter.get("/location/verify", async (req, res) => {
  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned from the API call.

  console.log(req.query.address)
  let verifyAddressRes;
  try {
    verifyAddressRes = await SmartyStreetsAPI.verifyAddress(req.query.address);
  } catch (err) {
    return res.status(400).json(resHelpers.makeError(err));
  }

  /** @type {import("./../Models").CanonicalAddress[]} */
  const canonicalAddresses = verifyAddressRes.data.map(ssAddress => {
    var address = _.compact([
      ssAddress.delivery_line_1,
      ssAddress.delivery_line_2,
      ssAddress.last_line
    ]).join(", ");

    var components = ssAddress.components;
    var district = ssAddress.metadata.congressional_district || "";

    return {
      address: address,
      district: district == "AL" ? "0" : district,
      county: ssAddress.metadata.county_name,
      components: {
        cityName: components.city_name,
        defaultCityName: components.default_city_name,
        plus4Code: components.plus4_code,
        primaryNumber: components.primary_number,
        secondaryNumber: components.secondary_number,
        stateAbbreviation: components.state_abbreviation,
        streetName: components.street_name,
        streetPostdirection: components.street_postdirection,
        streetPredirection: components.street_predirection,
        streetSuffix: components.street_suffix,
        zipcode: components.zipcode
      }
    };
  });

  res.json({
    status: "success",
    data: canonicalAddresses
  });
});

module.exports = expressRouter;
