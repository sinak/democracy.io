/**
 *
 */

var changeCaseKeys = require('change-case-keys');
var map = require('lodash.map');

var Legislator = require('../../../../models').Legislator;
var apiCallback = require('../helpers/api').apiCallback;
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {
  var makeResponse = function(data) {
    return map(data['results'], function(rawLegislator) {
      return new Legislator(changeCaseKeys(rawLegislator, 'camelize'))
    });
  };
  var cb = apiCallback(res, makeResponse);

  sunlight.locateLegislatorsViaSunlight(
    req.params.latitude, req.params.longitude, req.app.locals.CONFIG, cb);
};


module.exports.get = get;