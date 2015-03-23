/**
 * Top level controller for the democracy.io app.
 */


var HomeController = function($scope, $location, dioApi, dioRepData) { 
	
	dioRepData.repList = [];
	dioRepData.repDataRecieved = false;

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
    var geocode = {lat: location.lat(), lng: location.lng()};
		dioRepData.repList = dioApi.getRepsByLocation(geocode);
		dioRepData.repDataReceived = true;

    for (var i = 0; i < dioRepData.repList.length; ++i) {
			dioRepData.repList[i].selected = true;
		};

		$location
      .path('/location')
      .search(geocode);
	};

  $scope.$watch('data.geocode', function(newVal, oldVal) {
    // Use a try / catch here as there's a variety of null vs undefined conditions that could cause issues.
    try {
      $scope.data.invalidGeocode = angular.isUndefined(newVal.geometry.location.lat());
    } catch(err) {
      $scope.data.invalidGeocode = true;
      if((!angular.isUndefined(newVal) || newVal === null) && oldVal !== newVal){
        $scope.data.addressPristine = false;
      }
    };
  }, true);

};

module.exports = HomeController;
