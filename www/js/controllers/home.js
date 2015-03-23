/**
 * Top level controller for the democracy.io app.
 */


var HomeController = function($scope, $location, dioApi, dioRepData) { 
	
	dioRepData.repList = [];
	dioRepData.repDataRecieved = false;

	$scope.data = {
    address: '',
    geocode: {}
  };

  $scope.ngAutocompleteOptions = {
    country: 'US',
    type: 'geocode',
    watchEnter: true
  };

	$scope.submit = function(address){
		dioRepData.repList = dioApi.getRepsByLocation(address);
		dioRepData.repDataReceived = true;

    for (var i=0 ; i < dioRepData.repList.length ; i++){
			dioRepData.repList[i].selected = true;
		};

		$location.path('/location'); //TODO add address param
	};
};

module.exports = HomeController;
