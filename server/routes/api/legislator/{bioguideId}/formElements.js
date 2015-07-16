/**
 *
 */

var lodash = require('lodash');

var apiHelpers = require('../../helpers');
var potc = require('../../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  potc.getFormElementsForRepIdsFromPOTC([bioguideId], req.app.locals.CONFIG, function(err, data) {
    if (err) {
      res.status(400).json(apiHelpers.makeError(err));
    }

    var modelData = apiHelpers.makeLegislatorFormElements(data[bioguideId], bioguideId);
    res.json(apiHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
