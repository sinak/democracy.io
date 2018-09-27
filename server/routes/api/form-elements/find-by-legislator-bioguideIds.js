/**
 *
 */

var potc = require("../../../services/third-party-apis/potc");
var potcHelpers = require("../helpers/potc");
var resHelpers = require("../helpers/response");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
var get = function(req, res) {
  var bioguideIds = req.query.bioguideIds;

  potc
    .getFormElementsForRepIdsFromPOTC(bioguideIds)
    .then(formElementsRes => {
      var modelData = Object.keys(formElementsRes.data).map(id=> {
        return potcHelpers.makeLegislatorFormElements(
          formElementsRes.data[id],
          id
        );
      });

      res.json(resHelpers.makeResponse(modelData));
    })
    .catch(err => {
      res.status(400).json(resHelpers.makeError(err));
    });
};

module.exports.get = get;
