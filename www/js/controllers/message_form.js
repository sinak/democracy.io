/**
 *
 */

var isEmpty = require('lodash.isEmpty');

var MessageFormController = function($scope, $location, dioLegislatorData, dioApi, dioPageNav) {

  $scope.dioPageNav = dioPageNav;

  //	if (dioRepData.repDataReceived) {
  //		$scope.repData = dioRepData;
  //	} else {
  //
  //		// see if the address is in the url param
  //		params = $location.search()
  //		if (params.address) {
  //			dioRepData.repList = dioApi.getRepsByLocation(params.address);
  //		} else {
  //			$location.path('/');
  //		}
  //	}

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
      $scope.dioPageNav.goBack();
    }
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.getSelectedLegislators();
    console.log('legistlators:', $scope.legislators)
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
  };

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
    attemptToFetchLegislatorData($location.search());
  } else {
    $scope.setLegislators();
  }


};

module.exports = MessageFormController;
