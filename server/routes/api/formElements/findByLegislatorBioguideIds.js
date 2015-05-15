/**
 *
 */

var lodash = require('lodash');

var makeLegislatorFormElements = require('../helpers/potc').makeLegislatorFormElements;
var potc = require('../../../services/third-party-apis/potc');


var get = function (req, res) {
  var bioguideIds = req.params.bioguideIds;

  var cb = function(err, response) {
    if (err === null) {
      var results = lodash.reduce(response, function (results, val, bioguideId) {
        results.push(makeLegislatorFormElements(val, bioguideId));
        return results;
      }, []);

      res.json(results);
    } else {
      // TODO(leah): Throw an error
    }
  };

  potc.getFormElementsForRepIdsFromPOTC(bioguideIds, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
