/**
 * Verifies an address via SmartyStreets.
 */

var changeCaseKeys = require('change-case-keys');
var filter = require('lodash.filter');
var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');

var models = require('../../../../models');
var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  // TODO(leah): Move this cb to a helper w/ a model process layer, so it's not copy-pasted everywhere.
  var cb = function(response, err) {
    if (err === null) {
      var modelResponse = map(response, function(rawAddress) {
        var address = [rawAddress['delivery_line_1'], rawAddress['delivery_line_2'], rawAddress['last_line']];
        address = filter(address, function(addressBit) {
          return !isEmpty(addressBit);
        }).join(', ');

        return new models.CanonicalAddress({
          inputId: rawAddress['input_id'],
          inputIndex: rawAddress['input_index'],
          address: address,
          addressComponents: changeCaseKeys(rawAddress['components'], 'camelize')
        });
      });
      res.json(modelResponse);
    } else {
      // TODO(leah): Throw an error
    }
  };

  // NOTE: SS accepts "the street line of the address, or an entire address" for this.
  //       However, over-supplying data, e.g. giving
  //       {street: '123 Main St, San Francisco, CA 9411', city: 'San Francisco', state: 'CA'}
  //       confuses SS and kicks back an empty results array.
  //       So, just supply the full address returned from the API call.
  var params = {street: req.params.address};
  smartyStreets.verifyAddress(params, req.app.locals.CONFIG, cb);
};


module.exports.get = get;