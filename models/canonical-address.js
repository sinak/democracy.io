/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var filter = require('lodash.filter');
var isEmpty = require('lodash.isempty');

var AddressComponents = require('./address-components');
var Model = require('./model');


var CanonicalAddress = function(options) {
  Model.call(this, options);
};

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
  this.district = options.district;

  this.setModelProperty('components', options.components, AddressComponents);
};


CanonicalAddress.prototype.streetAddress = function() {
  var streetAddress = this.components.primaryNumber;
  if (!isEmpty(this.components.streetPredirection)) {
    streetAddress += ' ' + this.components.streetPredirection;
  }
  streetAddress += ' ' + this.components.streetName;
  if (!isEmpty(this.components.streetPostdirection)) {
    streetAddress += ' ' + this.components.streetPostdirection;
  }
  streetAddress += ' ' + this.components.streetSuffix;

  return streetAddress;
};


CanonicalAddress.prototype.cityState = function() {
  return [
    this.components.cityName,
    this.components.stateAbbreviation
  ].join(', ');
};


module.exports = CanonicalAddress;
