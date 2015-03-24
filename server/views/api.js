/**
 * Controllers for the API routes.
 */

var path = require('path');

var thirdPartyAPIs = require('../services/third_party_apis');


var getRepresentatives = function(req, res) {

  // TODO(leah): Update this to:
  //   * validate the query params

  var cb = function(jsonResponse, err) {
    if (err === null) {
      res.json(jsonResponse.results);
    } else {
      // TODO(leah): Throw an error
    }
  };

  thirdPartyAPIs.locateLegislatorsViaSunlight(
    req.query.lat, req.query.lng, req.app.locals.CONFIG, cb);
};


module.exports.getRepresentatives = getRepresentatives;
