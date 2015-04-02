/**
 *
 */

var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');

var MessageFormController = function($scope, $location, dioLegislatorData, dioApi, dioPageNav) {

  $scope.dioPageNav = dioPageNav;

	//TODO check if captchas are needed

	//TODO fill out list of topics
	$scope.topics = [
		'Agriculture',
		'Technology'
	];

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

    if (!angular.isEmpty(selectedBioguideIds)){
      var cb = function(legislatorsFormElements) {
        dioLegislatorData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLegislatorForm();
      };

      dioApi.legislatorFormElementsByBioguideIds(selectedBioguideIds, cb);
    } else {
      $scope.dioPageNav.back();
    }
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.getSelectedLegislators();
    console.log('legistlators:', $scope.legislators);
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
  };

  $scope.setLegislatorForm = function () {
    $scope.legislatorsFormElements = dioLegislatorData.getLegislatorsFormElements();
    console.log('form elements:', $scope.legislatorsFormElements);
  }

	$scope.submit = function(repData){
    //		if (repData.hasCaptcha){
    //			//TODO
    //
    //		} else {
    //			//TODO
    //			$location.path('/thanks');
    //
    //		};
	};

  if (isEmpty(dioLegislatorData.legislators)) {
    //attemptToFetchLegislatorData($location.search()); TODO?
    $location.path('/');
  } else {
    $scope.setLegislators();
  }

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
