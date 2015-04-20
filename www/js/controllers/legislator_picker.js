/**
 *
 */

var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');


var LegislatorPickerController = function($scope, $location, $timeout, dioLegislatorData, dioApi) {

  // TODO(leah): Wire this on to the rootscope?
  $scope.loadingDelay = true;
  
  $timeout(function(){
      $scope.loadingDelay = false;
    },
    350);


  var attemptToFetchLegislatorData = function(params) {
    if (!angular.isUndefined(params.lat) && !angular.isUndefined(params.lng)) {
      var cb = function(legislators) {
        dioLegislatorData.setLegislators(legislators);
        $scope.setLegislators();
      };
      
      dioApi.findLegislatorsByLatLng(params.lat, params.lng, cb);
		} else {
			// TODO send back a page;
		}
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.legislators;
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
  };

	$scope.submit = function() {
    $location.path('/compose');
	};

  if (isEmpty(dioLegislatorData.legislators)) {
    attemptToFetchLegislatorData($location.search());
	} else {
    $scope.setLegislators();
  }
};

module.exports = LegislatorPickerController;
