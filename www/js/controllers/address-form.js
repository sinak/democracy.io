/**
 * Controller to manage the address input form.
 */

var isEmpty = require('lodash.isempty');
var filter = require('lodash.filter');


var AddressFormController = function($scope, $location, dioData, dioAPI, $timeout) {
  var priorAddress = dioData.getCanonicalAddress()

  // See https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation
  $scope.patterns = {
    address: new RegExp(/[a-zA-Z\d\s\-\,\#\.\+]+/),
    city: new RegExp(/[a-zA-Z\d\s\-\,\#\.\+]+/),
    postal: new RegExp(/^\d{5,6}(?:[-\s]\d{4})?$/)
  };
  console.log (priorAddress.components)
  if (priorAddress.address) {
    $scope.addressData = {
      address: priorAddress.components.primaryNumber + " " + priorAddress.components.streetName + " " + priorAddress.components.streetSuffix,
      city: priorAddress.components.cityName + ', ' + priorAddress.components.stateAbbreviation,
      postal: priorAddress.components.zipcode
    };
  } else {
    $scope.addressData = {
      address: '',
      city: '',
      postal: ''
    };
  }

  $scope.data = {
    address: '',
    verifyingAddress: false
  };

  $scope.verifyAddress = function(address) {
    $scope.error = null;
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
          $scope.error = "There appears to be a problem with the server. Please try again, and if the problem persists, email democracy@eff.org with the address you used so we can try and fix the issue.";
        } else {
          $scope.error = "Your address was not recognized. Please check the address and try again.";
        }
      }

    };

    dioAPI.verifyAddress(address, cb);
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

  $scope.video = {};
  $scope.video.autoplayVideo = function() {
    var vidEl = document.querySelectorAll('#video')[0];
    var contEl = document.querySelectorAll('#video-container')[0];
    angular.element(contEl).addClass('ng-enter');
    $timeout(function() {
      vidEl.play();
    }, 1500);
  };

};

AddressFormController.$inject = [
  '$scope', '$location', 'dioData', 'dioAPI', '$timeout'
];

module.exports = AddressFormController;
