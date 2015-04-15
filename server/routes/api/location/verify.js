/**
 * Verifies an address via SmartyStreets.
 */

var changeCaseKeys = require('change-case-keys');

var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  // TODO(leah): Move this cb to a helper w/ a model process layer, so it's not copy-pasted everywhere.
  var cb = function(response, err) {
    console.log(response);
    if (err === null) {
      // TODO(leah): Dump this to a model obj once I figure out how multiple responses are produced by SS
      res.json(response);
    } else {
      // TODO(leah): Throw an error
    }
  };

  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned by SS autocomplete as the street param.
  var params = {street: req.params.address};
  smartyStreets.verifyAddress(params, req.app.locals.CONFIG, cb);
};


module.exports.get = get;