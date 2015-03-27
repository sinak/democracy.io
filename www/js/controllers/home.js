/**
 * Top level controller for the democracy.io app.
 */


var HomeController = function($scope, $location, dioApi, dioLegislatorData) {

	$scope.data = {
    address: '',
    geocode: undefined,
    invalidGeocode: true,
    addressPristine: true
  };

  $scope.ngAutocompleteOptions = {
    country: 'US',
    type: 'geocode',
    watchEnter: true
  };

	$scope.submit = function(location) {
    var lat = location.lat();
    var lng = location.lng();

    dioLegislatorData.clearData();
    // TODO: There should probably be a lag-delayed (~350ms) loading modal before firing the API call
		dioApi.findLegislatorsByLatLng(lat, lng, function(legislators) {
      dioLegislatorData.setLegislators(legislators);
      $location
        .path('/location')
        .search({lat: lat, lng: lng});
    });
	};

  var watchHasFired = false;
  $scope.$watch('data.geocode', function(newVal) {
    $scope.data.addressPristine = watchHasFired ? false : true;
    watchHasFired = true;

    // Use a try / catch here as there's a variety of null vs undefined conditions that could cause issues.
    try {
      $scope.data.invalidGeocode = angular.isUndefined(newVal.geometry.location.lat());
    } catch(err) {
      $scope.data.invalidGeocode = true;
    };
  }, true);

};

module.exports = HomeController;
