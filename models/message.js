/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


var Message = function(options) {
  options = isEmpty(options) ? {} : options;

  this.bioguideId = options.bioguideId;
};


Message.prototype.update = function(canonicalAddress) {
  this.$ADDRESS_STREET = canonicalAddress.streetAddress();
  this.$ADDRESS_CITY = canonicalAddress.components.cityName;
  this.$ADDRESS_STATE_POSTAL_ABBREV = canonicalAddress.components.stateAbbreviation;
  this.$ADDRESS_STATE_FULL = canonicalAddress.components.stateName;

  //  this.$ADDRESS_COUNTY = $scope.formData.county.selected;

  this.$ADDRESS_ZIP5 = canonicalAddress.components.zipcode;
  this.$ADDRESS_ZIP4 = canonicalAddress.components.plus4Code;
  this.$ADDRESS_ZIP_PLUS_4 = canonicalAddress.fullZipCode();
};


module.exports = Message;
