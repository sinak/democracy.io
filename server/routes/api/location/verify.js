/**
 * Verifies an address via SmartyStreets.
 */

var changeCaseKeys = require('change-case-keys');

var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  // TODO(leah): Move this cb to a helper w/ a model process layer, so it's not copy-pasted everywhere.
  var cb = function(response, err) {
    if (err === null) {
      // TODO(leah): Dump this to a model obj once I figure out how multiple responses are produced by SS
      res.json(response);
    } else {
      // TODO(leah): Throw an error
    }
  };

  var params = {
    street: req.params.address,
    city: req.params.city,
    state: req.params.state
  };

  smartyStreets.verifyAddress(params, req.app.locals.CONFIG, cb);
};


module.exports.get = get;
