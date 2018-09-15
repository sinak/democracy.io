/**
 * Verifies an address via SmartyStreets.
 */

var resHelpers = require("../helpers/response");
var ssHelpers = require("../helpers/smarty-streets");
var smartyStreets = require("../../../services/third-party-apis/smarty-streets");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
var get = function(req, res) {
  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned from the API call.

  smartyStreets
    .verifyAddress(req.query.address)
    .then(verifyAddressRes => {
      var canonicalAddresses = verifyAddressRes.data.map(
        ssHelpers.makeCanonicalAddressFromSSResponse
      );
      res.json(resHelpers.makeResponse(canonicalAddresses));
    })
    .catch(err => {
      console.log(err)
      res.status(400).json(resHelpers.makeError(err));
    });
};

module.exports.get = get;
