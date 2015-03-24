/**
 *
 */

var lodash = require('lodash');

var makeLFEModelFromPOTCResponse = require('../../helpers/make_lfe_model_from_potc_response');
var thirdPartyAPIs = require('../../../../services/third_party_apis');

var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  var cb = function(response, err) {
    if (err === null) {
      var lfeModel = makeLFEModelFromPOTCResponse(response[bioguideId], bioguideId);
      res.json(lfeModel);
    } else {
      // TODO(leah): Throw an error
    }
  };

  thirdPartyAPIs.getFormElementsForRepIdsFromPOTC([bioguideId], req.app.locals.CONFIG, cb);
};


module.exports.get = get;
