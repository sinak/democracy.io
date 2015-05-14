/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isUndefined');

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


CanonicalAddress.prototype.streetAddress = function() {
  // TODO(leah): This probably isn't sufficient in many cases, update to use the
  //             component info more efficiently.
  return [
    this.components.primaryNumber,
    this.components.streetName,
    this.components.streetSuffix
  ].join(' ');
};


CanonicalAddress.prototype.fullZipCode = function() {
  var zip = this.components.zipcode;
  return isUndefined(this.components.plus4Code) ?
    zip : zip + '-' + this.components.plus4Code;
};

module.exports = CanonicalAddress;
