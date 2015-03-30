/**
 * Fetches form elements from POTC for a supplied array of bioguideIds.
 */

var lodash = require('lodash');

var makeLFEModelFromPOTCResponse = require('../helpers/make_lfe_model_from_potc_response');
var thirdPartyAPIs = require('../../../services/third_party_apis');


var get = function (req, res) {
  var cb = function(response, err) {
    if (err === null) {

      var results = [];
      lodash.reduce(response, function(result, val, bioguideId) {
        var lfeModel = makeLFEModelFromPOTCResponse(val, bioguideId);
        results.push(lfeModel);
      }, results);

      res.json(results);
    } else {
      // TODO(leah): Throw an error
    }
  };

  thirdPartyAPIs.getFormElementsForRepIdsFromPOTC(req.params.bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
