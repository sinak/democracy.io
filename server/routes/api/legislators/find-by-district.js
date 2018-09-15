/**
 *
 */

var Congress = require("../../../services/congress");
var potc = require("../../../services/third-party-apis/potc");
var resHelpers = require("../helpers/response");

var Raven = require("../../../raven-client");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
var get = function(req, res) {
  var state = req.query.state,
    district = req.query.district;

  if (Congress.validDistrict(state, district) != true) {
    Raven.captureMessage(JSON.stringify(Congress.validDistrict(state, district)));
  }

  var legislators = Congress.getLegislators(state, district).filter(function(
    n
  ) {
    return n != undefined;
  });
  var bioguideIds = legislators.map(function(legislator) {
    return legislator.bioguideId;
  });

  if (!bioguideIds && !legislators) {
    res.status(400).json(
      resHelpers.makeError({
        message: "Missing legislator or bioguideID data."
      })
    );
  }
  // Call the PotC API get defunct and contact_url properties for each legislator
  potc.getFormElementsForRepIdsFromPOTC(bioguideIds).then(formElementsRes => {
    var augmentedLegislators = legislators.map(function(legislator) {
      var legislatorData = formElementsRes.data[legislator.bioguideId];

      return Object.assign(legislator, {
        defunct: legislatorData.defunct || false,
        contact_url: legislatorData.contact_url || null
      });
    });

    res.json(resHelpers.makeResponse(augmentedLegislators));
  });
};

module.exports.get = get;
