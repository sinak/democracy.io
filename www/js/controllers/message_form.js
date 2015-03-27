/**
 *
 */

var MessageFormController = function($scope, $location, dioLegislatorData, dioPageNav) {

  $scope.dioPageNav = dioPageNav;

  //	if (dioRepData.repDataReceived) {
  //		$scope.repData = dioRepData;
  //	} else {
  //
  //		// see if the address is in the url param
  //		params = $location.search()
  //		if (params.address) {
  //			dioRepData.repList = dioApi.getRepsByLocation(params.address);
  //		} else {
  //			$location.path('/');
  //		}
  //	}

	//TODO check if captchas are needed

	//TODO fill out list of topics
	$scope.topics = [
		'Agriculture',
		'Technology'
	];

	$scope.submit = function(repData){
    //		if (repData.hasCaptcha){
    //			//TODO
    //
    //		} else {
    //			//TODO
    //			$location.path('/thanks');
    //
    //		};
	};

};

module.exports = MessageFormController;
