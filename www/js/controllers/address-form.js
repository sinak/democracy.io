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
    invalidAddress: false,
    verifyingAddress: false
  };

  $scope.verifyAddress = function(address) {
    var cb = function(canonicalAddresses) {
      $scope.data.verifyingAddress = false;

      if (!isEmpty(canonicalAddresses)) {
        dioData.clearData();
        // It's possible to get multiple verified addresses for a single source address.
        // We've been unable to find an example of this to test though, so for now just pick
        // the first value and use that.
        dioData.setCanonicalAddress(canonicalAddresses[0]);
        $location.path('/location');
      } else {
        // TODO(leah/sina): Show some kind of address not found error
      }

    };

    dioApi.verifyAddress(address, cb);
  };

  $scope.validateAddress = function() {
    var filteredBits = filter(
      [$scope.addressData.address, $scope.addressData.city, $scope.addressData.postal],
      function(val) {
        return !isEmpty(val);
      }
    );

    $scope.data.address = filteredBits.join(', ');
    $scope.data.verifyingAddress = true;
    $scope.verifyAddress($scope.data.address);
  };

};

module.exports = AddressFormController;
