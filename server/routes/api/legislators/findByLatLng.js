/**
 *
 */

var changeCaseKeys = require('change-case-keys');
var map = require('lodash.map');

var Legislator = require('../../../../models').Legislator;
var apiHelpers = require('../helpers');
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {

  var locQuery = {
    latitude: req.query.latitude,
    longitude: req.query.longitude
  };

  sunlight.locateLegislatorsViaSunlight(locQuery, req.app.locals.CONFIG, function(err, data) {
    if (err) {
      res.status(400).json(apiHelpers.makeError(err));
    }

    var modelData = map(data['results'], function(rawLegislator) {
      return new Legislator(changeCaseKeys(rawLegislator, 'camelize'))
    });
    res.json(apiHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
