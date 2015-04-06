/**
 *
 */

var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');
var forEach = require('lodash.forEach');

var MessageFormController = function($scope, $location, $timeout, dioLegislatorData, dioApi, dioPageNav) {

  $scope.loadingDelay = true;
  
  $timeout(function(){
      $scope.loadingDelay = false;
    },
    350);

  $scope.dioPageNav = dioPageNav;

	//TODO fill out list of topics
	$scope.topics = [
		'Agriculture',
		'Technology'
	];

  $scope.formData = {};

  var attemptToFetchLegislatorData = function(params) {
    if (!angular.isUndefined(params.lat) && !angular.isUndefined(params.lng)) {
      var cb = function(legislators) {
        dioLegislatorData.setLegislators(legislators);
        $scope.setLegislators();
      };
      // TODO: There should probably be a lag-delayed (~350ms) loading modal before firing the API call
      dioApi.findLegislatorsByLatLng(params.lat, params.lng, cb);
    } else {
      $scope.dioPageNav.back();
    }
  };

  var attemptToFetchLegislatorForm = function(selectedBioguideIds) {
    var selectedBioguideIds = map(dioLegislatorData.getSelectedLegislators(), function(legislator) {
      return legislator.bioguideId;
    });

    if (!isEmpty(selectedBioguideIds)){
      var cb = function(legislatorsFormElements) {
        dioLegislatorData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLegislatorForm();
      };

      dioApi.legislatorFormElementsByBioguideIds(selectedBioguideIds, cb);
    } else {
      $scope.dioPageNav.back();
    }
  };

  var checkForCaptcha = function(){
    var hasCaptcha = false;
    forEach($scope.legislatorsFormElements, function(legislator){
      forEach(legislator.formElements, function(element){
        if (element.value === "$CAPTCHA_SOLUTION") {
          hasCaptcha = true;
        };
      });
    });

    return hasCaptcha;
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.getSelectedLegislators();
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
  };

  $scope.setLegislatorForm = function () {
    $scope.legislatorsFormElements = dioLegislatorData.getLegislatorsFormElements();
    console.log('form elements:', $scope.legislatorsFormElements);
  };

	$scope.submit = function(repData){
    if ($scope.hasCaptcha){
      //TODO
    } else {
      //TODO
      $location.path('/thanks');
    };
	};

  if (isEmpty(dioLegislatorData.legislators) || isEmpty(dioLegislatorData.selectedLegislators)) {
    //attemptToFetchLegislatorData($location.search()); TODO?
    $location.path('/');
  } else {
    $scope.setLegislators();
  }

  $scope.hasCaptcha = checkForCaptcha();

  var selectedBioguideIds = map(dioLegislatorData.getSelectedLegislators(), function(legislator) {
      return legislator.bioguideId;
    });

  if (isEmpty(dioLegislatorData.legislatorsFormElements)) {
    attemptToFetchLegislatorForm(selectedBioguideIds);
  } else {
    $scope.setLegislatorForm();
  }

};

module.exports = MessageFormController;
