/**
 *
 */

var isEmpty = require('lodash.isEmpty');


var LegislatorPickerController = function($scope, $location, dioLegislatorData, dioApi) {

  var attemptToFetchLegislatorData = function(params) {
    if (!angular.isUndefined(params.lat) && !angular.isUndefined(params.lng)) {
      var cb = function(legislators) {
        dioLegislatorData.setLegislators(legislators);
        $scope.setLegislators();
      };
      // TODO: There should probably be a lag-delayed (~350ms) loading modal before firing the API call
      dioApi.findLegislatorsByLatLng(params.lat, params.lng, cb);
		} else {
			$scope.goBack();
		}
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.legislators;
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
  };

	$scope.goBack = function() {
		$location.path('/');
	};

	$scope.submit = function() {
		$location.path('/representatives');
	};

  if (isEmpty(dioLegislatorData.legislators)) {
    attemptToFetchLegislatorData($location.search());
	} else {
    $scope.setLegislators();
  }
};

module.exports = LegislatorPickerController;
