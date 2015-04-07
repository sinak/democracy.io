/**
 *
 */

var lodash = require('lodash');

var makeLFEModelFromPOTCResponse = require('../helpers/make_lfe_model_from_potc_response');
var potc = require('../../../services/third-party-apis/potc');


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

  potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
