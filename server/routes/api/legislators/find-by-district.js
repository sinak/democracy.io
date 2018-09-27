/**
 * /api/1/legislators/find-by-district
 */

const Legislator = require("../../../../models").Legislator;
var CongressLegislators = require("../../../services/CongressLegislators");
var potc = require("../../../services/third-party-apis/potc");
var resHelpers = require("../helpers/response");

var Raven = require("../../../raven-client");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
var get = function(req, res) {
  const { state, district } = req.query;

  var legislators = CongressLegislators.findLegislatorsByDistrict(
    state,
    district.toString()
  );

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
  potc
    .getFormElementsForRepIdsFromPOTC(bioguideIds)
    .then(formElementsRes => {
      var augmentedLegislators = legislators
        .map(function(legislator) {
          var legislatorData = formElementsRes.data[legislator.bioguideId];

          return {
            ...legislator,
            defunct: legislatorData.defunct,
            contact_url: legislatorData.contact_url
          };
        })
        .map(l => new Legislator(l));

      res.json(resHelpers.makeResponse(augmentedLegislators));
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports.get = get;
