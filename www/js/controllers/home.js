/**
 * Top level controller for the democracy.io app.
 */



var HomeController = function($scope, $location, dioApi, dioRepData) { 
	
	dioRepData.repList = []
	dioRepData.repDataRecieved = false;

	$scope.address = '';

	$scope.submit = function(address){
		dioRepData.repList = dioApi.getRepsByLocation(address);
		dioRepData.repDataReceived = true;
		for (var i=0 ; i < dioRepData.repList.length ; i++){
			dioRepData.repList[i].selected = true;
		};
		console.log(dioRepData.repList);
		$location.path('/location'); //TODO add address param
	};
};

module.exports = HomeController;
