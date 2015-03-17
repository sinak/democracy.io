/**
 * Top level controller for the democracy.io app.
 */

var HomeController = function($scope, $location, dioApi, dioRepData) { 

	$scope.address = "";

	$scope.submit = function(address){
		console.log(address);
		dioRepData.repList = dioApi.getRepsByLocation(address);
		dioRepData.selectedReps = {
	  		rep0: true,
	  		rep1: true,
	  		rep2: true
	  	};
		console.log(dioRepData.repList);
		$location.path('/location');
	};
};

module.exports = HomeController;
