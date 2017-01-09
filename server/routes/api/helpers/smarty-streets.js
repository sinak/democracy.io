/**
 * Helpers for working with responses from the SmartyStreets API.
 */

var changeCaseKeys = require('change-case-keys');
var filter = require('lodash.filter');
var isEmpty = require('lodash.isempty');
var us = require('us');

var models = require('../../../../models');


var makeCanonicalAddressFromSSResponse = function(rawAddress) {
  var addressBits = [
    rawAddress['delivery_line_1'],
    rawAddress['delivery_line_2'],
    rawAddress['last_line']
  ];
  var filteredBits = /** @type {Array} */ filter(addressBits, function(addressBit) {
    return !isEmpty(addressBit);
  });
  var address = filteredBits.join(', ');

  var components = rawAddress['components'];
  var usRegion = us.lookup(components['state_abbreviation']);
  components.stateName = usRegion !== undefined ? usRegion.name : '';

  var district = rawAddress['metadata']['congressional_district'];

  return new models.CanonicalAddress({
    inputId: rawAddress['input_id'],
    inputIndex: rawAddress['input_index'],
    address: address,
    longitude: rawAddress['metadata']['longitude'],
    latitude: rawAddress['metadata']['latitude'],
    district: (district == "AL" ? "0" : district),
    county: rawAddress['metadata']['county_name'],
    components: changeCaseKeys(components, 'camelize')
  });

};


module.exports.makeCanonicalAddressFromSSResponse = makeCanonicalAddressFromSSResponse;
