/**
 * Controller to manage the address input form.
 */

var isEmpty = require('lodash.isEmpty');
var filter = require('lodash.filter');


var AddressFormController = function($scope, dioApi) {

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
    var cb = function(canonicalAddress) {
      //      dioLegislatorData.clearData();
      //      $location
      //          .path('/location')
      //          .search({lat: lat, lng: lng});

      $scope.data.verifyingAddress = false;
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
