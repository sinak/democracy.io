/**
 *
 */

var changeCaseKeys = require('change-case-keys');

var Legislator = require('../../../../models').Legislator;
var resHelpers = require('../helpers/response');
var sunlight = require('../../../services/third-party-apis/sunlight');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  sunlight.fetchActiveLegislatorBioViaSunlight(bioguideId, req.app.locals.CONFIG, function(err, data) {
    if (err) {
      res.status(400).json(resHelpers.makeError(err));
    }

    var modelData = new Legislator(changeCaseKeys(data['results'][0], 'camelize'));
    res.json(resHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
