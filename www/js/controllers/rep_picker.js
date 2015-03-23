/**
 *
 */

var RepPickerController = function($scope, $location, dioRepData) {
	
	//check if rep data is loaded
	if (dioRepData.repDataReceived) {
		$scope.repData = dioRepData;
		dioRepData.selectedReps = [];
		for (var i=0 ; i < dioRepData.repList.length ; i++){
			dioRepData.repList[i].selected = true;
		};
	} else {

		// see if the address is in the url param
		params = $location.search()
		if (params.address) {
			dioRepData.repList = dioApi.getRepsByLocation(params.address);
		} else {
			$location.path('/');
		}
		
		
	}
	

	$scope.goBack = function(){
		$location.path('/');
	};

	$scope.submit = function(){
		$location.path('/representatives');
	}
};

module.exports = RepPickerController;
