/**
 *
 */

var lodash = require('lodash');

var makeLegislatorFormElements = require('../../helpers/potc').makeLegislatorFormElementsFromPOTCResponse;
var potc = require('../../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  var cb = function(err, response) {
    if (err === null) {
      var lfeModel = makeLegislatorFormElements(response[bioguideId], bioguideId);
      res.json(lfeModel);
    } else {
      // TODO(leah): Throw an error
    }
  };

  potc.getFormElementsForRepIdsFromPOTC([bioguideId], req.app.locals.CONFIG, cb);
};


module.exports.get = get;
