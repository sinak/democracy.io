/**
 *
 */

var changeCaseKeys = require('change-case-keys');

var Legislator = require('../../../../models').Legislator;
var apiHelpers = require('../helpers');
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {
  sunlight.fetchActiveLegislatorBioViaSunlight(
    req.params.bioguideId,
    req.app.locals.CONFIG,
    function(err, data) {
      if (err) {
        res.status(400).json(apiHelpers.makeError(err));
      }

      var modelData = new Legislator(changeCaseKeys(data['results'][0], 'camelize'));
      res.json(apiHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
