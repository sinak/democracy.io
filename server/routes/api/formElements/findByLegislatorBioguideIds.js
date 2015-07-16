/**
 *
 */

var lodash = require('lodash');

var apiHelpers = require('../helpers');
var potc = require('../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideIds = req.query.bioguideIds;

  var makeResponse = function(data) {
    return lodash.reduce(data, function (results, val, bioguideId) {
      results.push(apiHelpers.makeLegislatorFormElements(val, bioguideId));
      return results;
    }, []);
  };

  var cb = apiHelpers.apiCallback(res, makeResponse);
  potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
