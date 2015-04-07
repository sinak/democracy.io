/**
 *
 */

var changeCaseKeys = require('change-case-keys');
var lodash = require('lodash');

var Legislator = require('../../../../models').Legislator;
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {

  var cb = function(response, err) {
    if (err === null) {
      var legislators = lodash.map(response['results'], function(rawLegislator) {
        return new Legislator(changeCaseKeys(rawLegislator, 'camelize'))
      });
      res.json(legislators);
    } else {
      // TODO(leah): Throw an error
    }
  };

  sunlight.locateLegislatorsViaSunlight(
    req.params.latitude, req.params.longitude, req.app.locals.CONFIG, cb);
};


module.exports.get = get;