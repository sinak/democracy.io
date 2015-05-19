/**
 *
 */

var changeCaseKeys = require('change-case-keys');

var Legislator = require('../../../../models').Legislator;
var apiCallback = require('../helpers/api').apiCallback;
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {
  var makeResponse = function(data) {
    return new Legislator(changeCaseKeys(data['results'][0], 'camelize'));
  };
  var cb = apiCallback(res, makeResponse);
  sunlight.fetchActiveLegislatorBioViaSunlight(req.params.bioguideId, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
