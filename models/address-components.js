/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


function AddressComponents(options) {
  options = isEmpty(options) ? {} : options;

  this.primaryNumber = options.primaryNumber;
  this.streetName = options.streetName;
  this.streetPredirection = options.streetPredirection;
  this.streetPostdirection = options.streetPostdirection;
  this.streetSuffix = options.streetSuffix;
  this.secondaryNumber = options.secondaryNumber;
  this.cityName = options.cityName;
  this.defaultCityName = options.defaultCityName;
  this.stateAbbreviation = options.stateAbbreviation;
  this.zipcode = options.zipcode;
  this.plus4Code = options.plus4Code;
}

module.exports = AddressComponents;
