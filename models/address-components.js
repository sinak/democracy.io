/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isUndefined');

var Model = require('./model');


function AddressComponents(options) {
  Model.call(this, options);
}

AddressComponents.prototype = create(Model.prototype, {
  'constructor': Model
});


AddressComponents.prototype.setProperties = function(options) {
  this.primaryNumber = options.primaryNumber;
  this.streetName = options.streetName;
  this.streetPredirection = options.streetPredirection;
  this.streetPostdirection = options.streetPostdirection;
  this.streetSuffix = options.streetSuffix;
  this.secondaryNumber = options.secondaryNumber;
  this.cityName = options.cityName;
  this.defaultCityName = options.defaultCityName;
  this.stateAbbreviation = options.stateAbbreviation;
  this.stateName = options.stateName;
  this.zipcode = options.zipcode;
  this.plus4Code = options.plus4Code;
};


AddressComponents.prototype.fullZipCode = function() {
  var zip = this.zipcode;
  return isUndefined(this.plus4Code) ? zip : zip + '-' + this.plus4Code;
};


module.exports = AddressComponents;
