/**
 * Verifies an address via SmartyStreets.
 */

var map = require('lodash.map');

var resHelpers = require('../helpers/response');
var ssHelpers = require('../helpers/smarty-streets');
var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned from the API call.
  var params = {street: req.query.address};
  smartyStreets.verifyAddress(params, req.app.locals.CONFIG, function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    var canonicalAddresses = map(data, ssHelpers.makeCanonicalAddressFromSSResponse);
    res.json(resHelpers.makeResponse(canonicalAddresses));
  });
};


module.exports.get = get;
