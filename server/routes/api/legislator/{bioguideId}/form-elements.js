/**
 *
 */

var lodash = require('lodash');

var resHelpers = require('../../helpers/response');
var potc = require('../../../../services/third-party-apis/potc');
var potcHelpers = require('../../helpers/potc');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  potc.getFormElementsForRepIdsFromPOTC([bioguideId], req.app.locals.CONFIG, function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    var modelData = potcHelpers.makeLegislatorFormElements(data[bioguideId], bioguideId);
    res.json(resHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
