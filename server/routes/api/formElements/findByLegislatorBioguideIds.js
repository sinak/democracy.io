/**
 *
 */

var lodash = require('lodash');

var makeLFEModelFromPOTCResponse = require('../helpers/make_lfe_model_from_potc_response');
var thirdPartyAPIs = require('../../../services/third_party_apis');

var get = function (req, res) {
  var bioguideIds = req.params.bioguideIds;

  var cb = function(response, err) {
    if (err === null) {
      var results = lodash.reduce(response, function (results, val, bioguideId) {
        results.push(makeLFEModelFromPOTCResponse(val, bioguideId));
        return results;
      }, []);

      res.json(results);
    } else {
      // TODO(leah): Throw an error
    }
  };

  thirdPartyAPIs.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
