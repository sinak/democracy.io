/**
 * Controller to manage the address input form.
 */

var isEmpty = require('lodash.isempty');
var filter = require('lodash.filter');

var CanonicalAddress = require('../../../models').CanonicalAddress;
var helpers = require('../helpers/address-form');


var AddressFormController = /*@ngInject*/ function($scope, $location, dioData, dioAPI, $timeout, $document) {
  $scope.addressData = helpers.getAddressData(dioData.getCanonicalAddress());

  $scope.data = {
    address: '',
    verifyingAddress: false
  };

  $scope.verifyAddress = function(address) {
    $scope.error = null;
    var cb = function(err, canonicalAddresses) {
      $scope.data.verifyingAddress = false;
      var validationRes = helpers.validateAddressResponse(err, canonicalAddresses, $scope.addressData.postal);

      if (validationRes instanceof CanonicalAddress) {
        dioData.clearData();
        dioData.setCanonicalAddress(validationRes);
        $location.path('/location');
      } else {
        $scope.error = validationRes;
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

  $scope.autoplayVideo = function(event, inview, inviewpart) {
    // If all of video is in-view, then play
    if (inview && inviewpart === 'both') {
      var vidEl = document.querySelectorAll('#video')[0];
      var contEl = document.querySelectorAll('#video-container')[0];
      if (inview === true) {
        if (angular.element(contEl).hasClass('ng-enter')){
          vidEl.play();
        }
        else {
          angular.element(contEl).addClass('ng-enter');
          $timeout(function() {
            vidEl.play();
          }, 1500);
        }
      }
    }
    // If video leaves view, pause.
    else if (!inview || inviewpart !== 'both') {
      var vidEl = document.querySelectorAll('#video')[0];
      vidEl.pause();
    }
  };

  $scope.showAbout = function() {
    var leadEl = document.querySelectorAll('#about-lead')[0];
    var aboutEl = document.querySelectorAll('#about')[0];
    var toggleEl = document.querySelectorAll('#showAbout')[0];
    angular.element(aboutEl).addClass('ng-enter').removeClass('hidden');
    angular.element(toggleEl).addClass('ng-hide');
    // TODO(sina): There shouldn't be document / element interaction in the controller, adapt / alter this.
    $document.scrollToElement(angular.element(leadEl), 0, 1000);
    window.readMoreOpen = true;
  };

  $scope.animate = function(event,inview,inviewpart){
    //console.log(readMoreOpen, event, inview, inviewpart);
    if (typeof readMoreOpen !== 'undefined' && readMoreOpen === true && inview && inviewpart === 'both') {
      angular.element(event.inViewTarget).addClass('icon-enter');
    }
  };

};


module.exports = AddressFormController;
