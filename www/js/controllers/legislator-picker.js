/**
 *
 */

var filter = require('lodash.filter');
var isEmpty = require('lodash.isEmpty');
var isNumber = require('lodash.isNumber');
var map = require('lodash.map');


var LegislatorPickerController = function($scope, $location, $timeout, dioData, dioApi) {

  // TODO(leah): Wire this on to the rootscope?
  $scope.loadingDelay = true;

  $timeout(function() {
    $scope.loadingDelay = false;
  }, 350);

  /**
   * The Legislator objects the user can pick from.
   * @type {Array}
   */
  $scope.legislators = [];

  /**
   * A map from bioguideId to whether or not the user has selected them to speak to.
   * @type {{}}
   */
  $scope.bioguideIdsBySelection = {};

  $scope.fetchLegislators = function(canonicalAddress) {
    if (isNumber(canonicalAddress.latitude) && isNumber(canonicalAddress.longitude)) {
      var cb = function(legislators) {
        dioData.setLegislators(legislators);
        $scope.setLocalData();
      };
      
      dioApi.findLegislatorsByLatLng(
        canonicalAddress.latitude, canonicalAddress.longitude, cb);
		} else {
			// TODO send back a page;
		}
  };

  $scope.setLocalData = function() {
    $scope.legislators = dioData.getLegislators();
    $scope.bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
  };

	$scope.submit = function() {
    dioData.setBioguideIdsBySelection($scope.bioguideIdsBySelection);
    $location.path('/compose');
	};

  $scope.anyLegislatorSelected = function() {
    return isEmpty(filter($scope.bioguideIdsBySelection, function(selected) {
      return selected;
    }));
  };

  if (!dioData.hasLegislators()) {
    $scope.fetchLegislators(dioData.getCanonicalAddress());
	} else {
    $scope.setLocalData();
  }

};

module.exports = LegislatorPickerController;
