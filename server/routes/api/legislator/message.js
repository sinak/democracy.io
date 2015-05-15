/**
 * Handles posting a new message to POTC.
 */

var models = require('../../../../models');


var post = function (req, res) {
  var msg = new models.Message(req.body);

//  Message.prototype.update = function(canonicalAddress) {
//  this.$ADDRESS_STREET = canonicalAddress.streetAddress();
//  this.$ADDRESS_CITY = canonicalAddress.components.cityName;
//  this.$ADDRESS_STATE_POSTAL_ABBREV = canonicalAddress.components.stateAbbreviation;
//  this.$ADDRESS_STATE_FULL = canonicalAddress.components.stateName;
//
//  //  this.$ADDRESS_COUNTY = $scope.formData.county.selected;
//
//  this.$ADDRESS_ZIP5 = canonicalAddress.components.zipcode;
//  this.$ADDRESS_ZIP4 = canonicalAddress.components.plus4Code;
//  this.$ADDRESS_ZIP_PLUS_4 = canonicalAddress.fullZipCode();
//};

  res.json({});
};


module.exports.post = post;
