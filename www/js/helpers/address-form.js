/**
 * Helpers for working with the address form.
 */

var isEmpty = require('lodash.isempty');


// TODO(leah): Move this to a localization friendly format and figure out how to hook that in to
//             angular.
/**
 * Lookup for human readable address errors.
 * @type {{}}
 */
var ADDRESS_ERR_LOOKUP = {
  SERVER: 'There appears to be a problem with the server. Please try again, and if the problem persists, email democracy@eff.org with the address you used so we can try and fix the issue.',
  UNRECOGNIZED: 'Your address was not recognized. Please check the address and try again.',
  MISMATCHED_ZIP: 'The zipcode you entered does not match the verified zip code for your street address. Please check the address and try again.'
};


/**
 * Validates that the address returned by SmartyStreets is usable.
 * @param err Error encountered on making the the verify address call.
 * @param canonicalAddresses
 * @param zipcode The user entered zipcode
 */
var validateAddressResponse = function(err, canonicalAddresses, zipcode) {
  var errText = null;

  // It's possible to get multiple verified addresses for a single source address.
  // We've been unable to find an example of this to test though, so for now just pick
  // the first value and use that.
  var canonicalAddress = isEmpty(canonicalAddresses) ? null : canonicalAddresses[0];

  if (err !== null) {
    errText = ADDRESS_ERR_LOOKUP.SERVER;
  } else if (isEmpty(canonicalAddresses)) {
    errText = ADDRESS_ERR_LOOKUP.UNRECOGNIZED;
  } else if (canonicalAddress !== null) {
    // Check properties of the returned address to confirm that it matches user input
    if (canonicalAddress.components.zipcode !== zipcode) {
      errText = ADDRESS_ERR_LOOKUP.MISMATCHED_ZIP;
    }
  }

  return errText === null ? canonicalAddress : errText;
};


/**
 * Creates an address data object for model / view data binding.
 * @param canonicalAddress
 * @returns {{address: string, city: string, postal: string}}
 */
var getAddressData = function(canonicalAddress) {
  var hasPriorAddress = !isEmpty(canonicalAddress);
  return {
    address: hasPriorAddress ? canonicalAddress.streetAddress() : '',
    city: hasPriorAddress ? canonicalAddress.cityState() : '',
    postal: hasPriorAddress ? canonicalAddress.components.zipcode : ''
  };
};


module.exports.ADDRESS_ERR_LOOKUP = ADDRESS_ERR_LOOKUP;
module.exports.validateAddressResponse = validateAddressResponse;
module.exports.getAddressData = getAddressData;
