/**
 * Top level controller for the democracy.io app.
 */

var HomeController = function($scope, $location, dioApi, dioRepData) { 

	$scope.address = '';

	$scope.submit = function(address){
		dioRepData.repList = dioApi.getRepsByLocation(address);
		dioRepData.selectedReps = [];
		for (var i=0 ; i < dioRepData.repList.length ; i++){
			dioRepData.selectedReps.push(true);
		};
		console.log(dioRepData.repList);
		$location.path('/location');
	};
};

module.exports = HomeController;
