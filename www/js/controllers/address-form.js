/**
 * Controller to manage the address input form.
 */

var isEmpty = require('lodash.isEmpty');
var filter = require('lodash.filter');


var AddressFormController = function($scope, $location, dioApi, dioData) {

  // See https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation
  $scope.patterns = {
    address: new RegExp(/[a-zA-Z\d\s\-\,\#\.\+]+/),
    city: new RegExp(/[a-zA-Z\d\s\-\,\#\.\+]+/),
    postal: new RegExp(/^\d{5,6}(?:[-\s]\d{4})?$/)
  };

  $scope.addressData = {
    address: '',
    city: '',
    postal: ''
  };

  $scope.data = {
    address: '',
    verifyingAddress: false
  };

  $scope.verifyAddress = function(address) {
    var cb = function(err, canonicalAddresses) {
      $scope.data.verifyingAddress = false;
      var addressFound = !isEmpty(canonicalAddresses);
      var serverErr = !isEmpty(err);

      if (addressFound && !serverErr) {
        dioData.clearData();
        // It's possible to get multiple verified addresses for a single source address.
        // We've been unable to find an example of this to test though, so for now just pick
        // the first value and use that.
        dioData.setCanonicalAddress(canonicalAddresses[0]);
        $location.path('/location');
      } else {
        if (serverErr) {
          // TODO(sina): Show a server error, try again later
        } else {
          // TODO(sina): Show an address not found error
        }
      }

    };

    dioApi.verifyAddress(address, cb);
  };

  $scope.getAddressString = function() {
     var filteredBits = filter(
      [$scope.addressData.address, $scope.addressData.city, $scope.addressData.postal],
      function(val) {
        return !isEmpty(val);
      }
    );

    return filteredBits.join(', ');
  };

  $scope.validateAddress = function() {
    if ($scope.addressForm.$valid) {
      $scope.data.address = $scope.getAddressString();
      $scope.data.verifyingAddress = true;
      $scope.verifyAddress($scope.data.address);
    }
  };

};

module.exports = AddressFormController;
