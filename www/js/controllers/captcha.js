/**
 *
 */

var filter = require('lodash.filter');
var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');

var CaptchaSolution = require('../../../models').CaptchaSolution;


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

  	var cb = function(err, response) {
      var serverErr = !isEmpty(err);

      if (!serverErr) {
        var status = response.status;

        if (status === 'success') {
          captcha.success = true;
          $scope.captchasRemaining -= 1;
        } else {
          // TODO(sina): Show a "solution" failed, plz retry message by the captcha
        }

        if ($scope.captchasRemaining === 0) {
          $location.path('/thanks');
        }
      } else {
        // TODO(sina): Throw a try again later err
      }
  	};

  	dioApi.submitCaptchaResponse(new CaptchaSolution(captcha), cb);
  };

  /**
   * Fetch data from the session store.
   */
  $scope.fetchDataFromStore = function() {
    var messageResponses = dioData.getMessageResponses();
    if (isEmpty(messageResponses)) {
      $scope.goBack();
    }

    var captchasReceived = map(messageResponses, function(messageResponse) {
      $scope.captchasRemaining += 1;
      return {
        link: messageResponse.url,
        uid: messageResponse.uid,
        answer: '',
        success: false,
        waitingForResponse: false,
        bioguideId: messageResponse.bioguideId
      };
    });
    $scope.captchasReceived = filter(captchasReceived, function(captcha) {
      return !angular.isUndefined(captcha.link);
    });
  };

  $scope.fetchDataFromStore();

};

module.exports = CaptchaController;
