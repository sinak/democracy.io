/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');

var AddressComponents = require('./address-components');


function CanonicalAddress(options) {
  options = isEmpty(options) ? {} : options;
    
  this.inputId = options.inputId;
  this.inputIndex = options.inputIndex;
  this.address = options.address;

  this.components = new AddressComponents(options.addressComponents);
}

module.exports = CanonicalAddress;
