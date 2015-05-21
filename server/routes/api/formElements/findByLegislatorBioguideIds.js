/**
 *
 */

var lodash = require('lodash');

var makeLegislatorFormElements = require('../helpers/potc').makeLegislatorFormElements;
var apiCallback = require('../helpers/api').apiCallback;
var potc = require('../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideIds = req.query.bioguideIds;

  var makeResponse = function(data) {
    return lodash.reduce(data, function (results, val, bioguideId) {
      results.push(makeLegislatorFormElements(val, bioguideId));
      return results;
    }, []);
  };

  var cb = apiCallback(res, makeResponse);
  potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
