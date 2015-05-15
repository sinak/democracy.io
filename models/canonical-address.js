/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var AddressComponents = require('./address-components');
var Model = require('./model');


function CanonicalAddress(options) {
  Model.call(this, options);
}

CanonicalAddress.prototype = create(Model.prototype, {
  'constructor': Model
});


CanonicalAddress.prototype.setProperties = function(options) {
  this.inputId = options.inputId;
  this.inputIndex = options.inputIndex;
  this.address = options.address;
  this.county = options.county;
  this.longitude = options.longitude;
  this.latitude = options.latitude;

  this.setModelProperty('components', options.components, AddressComponents);
};


CanonicalAddress.prototype.streetAddress = function() {
  // TODO(leah): This probably isn't sufficient in many cases, update to use the
  //             component info more efficiently.
  return [
    this.components.primaryNumber,
    this.components.streetName,
    this.components.streetSuffix
  ].join(' ');
};


module.exports = CanonicalAddress;
