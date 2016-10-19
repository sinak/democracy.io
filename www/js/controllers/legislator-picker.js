/**
 *
 */

var filter = require('lodash.filter');
var isEmpty = require('lodash.isempty');
var isNumber = require('lodash.isnumber');
var map = require('lodash.map');

var LegislatorPickerController = /*@ngInject*/ function($scope, $location, $timeout, dioData, dioAPI) {

  // TODO(leah): Wire this on to the rootscope?
  $scope.loadingDelay = true;

  $timeout(function() {
    $scope.loadingDelay = false;
  }, 350);

  $scope.goBack = function(){
    $location.path('/');
  };

  /**
   * The Legislator objects the user can pick from.
   * @type {Array}
   */
  $scope.legislators = [];

  /**
   * Map from bioguideId to whether the user has selected that rep to message.
   * @type {{}}
   */
  $scope.bioguideIdsBySelection = {};

  /**
   * Whether any rep has been selected to message.
   * @returns {*}
   */
  $scope.anyRepSelected = function() {
    return isEmpty(filter($scope.bioguideIdsBySelection, function(selected) {
      return selected;
    }));
  };

  $scope.fetchLegislators = function(canonicalAddress) {

    var cb = function(err, legislators) {
      var legislatorsFound = !isEmpty(legislators);
      var serverErr = !isEmpty(err);

      if (legislatorsFound && !serverErr) {
        dioData.setLegislators(legislators);
        $scope.setLocalData();
      } else {
        if (serverErr) {
          // TODO(sina): Show a server error, try again later
        } else {
          // TODO(sina): Decide what to do here. Maybe clear dio-data and kick the user back?
        }
      }
    };

    dioAPI.findLegislatorsByDistrict(
      canonicalAddress.components.stateAbbreviation, canonicalAddress.district, cb);
  };

	$scope.submit = function() {
    dioData.setBioguideIdsBySelection($scope.bioguideIdsBySelection);
    $location.path('/compose');
	};

  /**
   * Stitches data from dio data to the local $scope.
   */
  $scope.setLocalData = function() {
    $scope.legislators = dioData.getLegislators();
    $scope.bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
  };

  if (!dioData.hasCanonicalAddress()){
    $scope.goBack();
  }

  if (!dioData.hasLegislators()) {
    $scope.fetchLegislators(dioData.getCanonicalAddress());
	} else {
    $scope.setLocalData();
  }

};

module.exports = LegislatorPickerController;
