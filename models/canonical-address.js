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
  this.county = options.county;
  this.longitude = options.longitude;
  this.latitude = options.latitude;

  this.components = new AddressComponents(options.components);
}

module.exports = CanonicalAddress;
