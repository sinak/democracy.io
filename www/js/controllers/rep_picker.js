/**
 *
 */

var RepPickerController = function($scope, $location) {
	$scope.goBack = function(){
		$location.path('/');
	};

	$scope.submit = function(){
		//TODO
	}
};

module.exports = RepPickerController;
