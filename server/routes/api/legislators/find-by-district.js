/**
 *
 */


var Congress = require('../../../services/congress');
var potc = require('../../../services/third-party-apis/potc');
var resHelpers = require('../helpers/response');

var get = function (req, res) {
  var state = req.query.state,
      district = req.query.district;

  if (!Congress.validDistrict(state, district))
    res.status(400).json(resHelpers.makeError({ message: "Bad value for state/district parameter" }));
  else {
    var legislators = Congress.getLegislators(state, district);
    var bioguideIds = legislators.map(function(legislator) {
      return legislator.bioguideId;
    });
    
    if (bioguideIds && legislators) {
      // Call the PotC API get defunct and contact_url properties for each legislator
      potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, function(err, data) {
        if (err) {
          res.status(400).json(resHelpers.makeError(err));
        }

        var augmentedLegislators = legislators.map(function(legislator) {
          legislator.defunct = data[legislator.bioguideId].defunct || false;
          legislator.contact_url = data[legislator.bioguideId].contact_url || null;
          return legislator;
        });

        res.json(resHelpers.makeResponse(augmentedLegislators));
      });
    }
    else {
      res.status(400).json(resHelpers.makeError({message: 'Missing legislator or bioguideID data.'}));
    }
  }
};

module.exports.get = get;
