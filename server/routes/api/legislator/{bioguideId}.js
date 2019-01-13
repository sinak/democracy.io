/**
 *
 */

var resHelpers = require("../helpers/response");
const CongressLegislators = require("../../../services/Legislators");
const Legislator = require("./../../../../models/legislator");

var get = function(req, res) {
  var bioguideId = req.params.bioguideId.toString();

  var legislator = CongressLegislators.getLegislatorByID(bioguideId);

  if (!legislator)
    res.status(400).json(
      resHelpers.makeError({
        message: "No legislator matches this bioguide id"
      })
    );
  else res.json(resHelpers.makeResponse(new Legislator(legislator)));
};

module.exports.get = get;
