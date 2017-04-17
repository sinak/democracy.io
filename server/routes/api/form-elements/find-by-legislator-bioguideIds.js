/**
 *
 */

var lodash = require('lodash');

var potc = require('../../../services/third-party-apis/potc');
var potcHelpers = require('../helpers/potc');
var resHelpers = require('../helpers/response');


var get = function (req, res) {
  var bioguideIds = req.query.bioguideIds;

  potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    var modelData = lodash.reduce(data, function(results, val, bioguideId) {
      results.push(potcHelpers.makeLegislatorFormElements(val, bioguideId));
      return results;
    }, []);
    res.json(resHelpers.makeResponse(modelData));
  });
};


module.exports.get = get;
