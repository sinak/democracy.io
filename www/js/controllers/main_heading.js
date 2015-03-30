var HeadingController = function($scope, $location) {

	$scope.$on('$routeChangeSuccess', function(event, newLoc, oldLoc){
		
		if($location.path() === "/"){
			$scope.pageName = "home";
		} else {
			$scope.pageName = $location.path();
		}

		if( $scope.pageName.charAt( 0 ) === '/' ){
    		$scope.pageName = $scope.pageName.slice( 1 );
    	}

		var header = document.querySelector('#main-header');

		header.dataset.pagename = $scope.pageName;

	});

};

module.exports = HeadingController;