/**
 *
 */

var MessageFormController = function($scope, $location, dioRepData) {
	$scope.goBack = function(){
		$location.path('/location');
	};

	$scope.submit = function(repData){
		if (repData.hasCaptcha){
			//TODO

		} else {
			//TODO
		};
	}

};

module.exports = MessageFormController;
