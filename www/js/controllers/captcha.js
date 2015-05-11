/**
 *
 */
var findWhere = require('lodash.findWhere')

var CaptchaController = function($scope, $location, $timeout, dioApi) {

	$scope.loadingDelay = true;
	$timeout(function(){
      $scope.loadingDelay = false;
    },
    350);

	$scope.captchasReceived = [];
  $scope.captchasRemaining = $scope.captchasReceived.length;

  // stub for loading captcha
  $timeout(function(){
  	$scope.captchasReceived = [
  		{
  			link: '/static/img/difficult-captcha.jpg',
  			uid: '123456',
  			answer: '',
  			success: false,
  			waitingForResponse: false
  		},
			{
  			link: '/static/img/difficult-captcha.jpg',
  			uid: '123456',
  			answer: '',
  			success: false,
  			waitingForResponse: false
  		}
  	]
  },
  1000);
  // end stub

  $scope.submit = function(captcha){
  	captcha.waitingForResponse = true;

  	var cb = function(response){
  		if (response.success){
  			captcha.success = true;
				var index = $scope.captchasReceived.indexOf(captcha);
				if (index > -1){
					$scope.captchasReceived.splice(index, 1);
				}
  		} else {
  			//TODO - work up fail state
  		}

  		if ($scope.captchasRemaining === 0){
  			$location.path('/thanks');
  		}
  	};

  		dioApi.submitCaptchaResponse(captcha.uid, captcha.answer, cb);
  };
};

module.exports = CaptchaController;
