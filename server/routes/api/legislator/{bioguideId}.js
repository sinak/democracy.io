/**
 *
 */

var changeCaseKeys = require('change-case-keys');

var Legislator = require('../../../models/legislator');
var thirdPartyAPIs = require('../../../services/third_party_apis');


var get = function (req, res) {
  var cb = function(response, err) {
    if (err === null) {
      var legislator = new Legislator(changeCaseKeys(response['results'][0], 'camelize'));
      res.json(legislator);
    } else {
      // TODO(leah): Throw an error
    }
  };

  thirdPartyAPIs.fetchActiveLegislatorBioViaSunlight(req.params.bioguideId, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
