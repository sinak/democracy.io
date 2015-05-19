/**
 *
 */

var lodash = require('lodash');

var apiCallback = require('../../helpers/api').apiCallback;
var makeLegislatorFormElements = require('../../helpers/potc').makeLegislatorFormElementsFromPOTCResponse;
var potc = require('../../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  var makeResponse = function(data) {
    return makeLegislatorFormElements(data[bioguideId], bioguideId);
  };
  var cb = apiCallback(res, makeResponse);

  potc.getFormElementsForRepIdsFromPOTC([bioguideId], req.app.locals.CONFIG, cb);
};


module.exports.get = get;
