/**
 *
 */

var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');


var CaptchaController = function($scope, $location, $timeout, dioData, dioApi) {

  /**
   *
   * @type {number}
   */
  $scope.captchasRemaining = 0;

  /**
   *
   * @type {Array}
   */
  $scope.captchasReceived = [];

  $scope.goBack = function() {
    if (!dioData.hasCanonicalAddress()) {
      $location.path('/');
    } else {
      $location.path('/location');
    }
  };

  $scope.submit = function(captcha) {
  	captcha.waitingForResponse = true;

  	var cb = function(response) {
  		if (response.success) {
  			captcha.success = true;
				var index = $scope.captchasReceived.indexOf(captcha);
				if (index > -1) {
					$scope.captchasReceived.splice(index, 1);
				}
  		} else {
  			// TODO - work up fail state
  		}

  		if ($scope.captchasRemaining === 0) {
  			$location.path('/thanks');
  		}
  	};

  	dioApi.submitCaptchaResponse(captcha.uid, captcha.answer, cb);
  };

  /**
   * Fetch data from the session store.
   */
  $scope.fetchDataFromStore = function() {
    var messageResponses = dioData.getMessageResponses();
    if (isEmpty(messageResponses)) {
      $scope.goBack();
    }

    $scope.captchasReceived = map(messageResponses, function(messageResponse) {
      return {
        link: messageResponse.url,
        uid: messageResponse.uid,
        answer: '',
        success: false,
        waitingForResponse: false
      };
    });
    $scope.captchasRemaining = $scope.captchasReceived.length;
  };

  $scope.fetchDataFromStore();

};

module.exports = CaptchaController;
