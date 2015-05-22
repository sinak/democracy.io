/**
 *
 */

var findWhere = require('lodash.findWhere');
var filter = require('lodash.filter');
var forEach = require('lodash.forEach');
var isArray = require('lodash.isArray');
var isEmpty = require('lodash.isEmpty');
var isUndefined = require('lodash.isUndefined');
var map = require('lodash.map');

var helpers = require('../helpers/message-form');


var MessageFormController = function($scope, $location, $timeout, dioData, dioApi) {
  // TODO(leah): Nitpicks:
  //   * wire up the error fields to use better show conditions, so the phone err msg etc doesn't immediately show on typing
  //   * The "Dear [Rep / Senator] text scrolls over other text entered in that box

  $scope.loadingDelay = true;
  $scope.submitted = false;
  $scope.joinEmailList = false;

  $timeout(function() {
    $scope.loadingDelay = false;
  }, 350);

  $scope.goBack = function() {
    if (!dioData.hasCanonicalAddress()) {
      $location.path('/');
    } else {
      $location.path('/location');
    }
  };

  /**
   *
   * @type {{}}
   */
  $scope.formData = {
    prefix: 'Ms'
  };

  /**
   *
   * @type {{}}
   */
  $scope.countyData = {};

  /**
   *
   * @type {Array}
   */
  $scope.topicOptions = {};

  /**
   * Fetch LegislatorFormElements models from the server for the supplied bioguideIds.
   * @param {Array} bioguideIds
   */
  $scope.fetchlegislatorFormElems = function(bioguideIds) {
    var cb = function(err, legislatorsFormElements) {
      var lfeFound = !isEmpty(legislatorsFormElements);
      var serverErr = !isEmpty(err);

      if (lfeFound) {
        dioData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLocalData();
      } else {
        if (serverErr) {
          // TODO(sina): Show a server err
        } else {
          // TODO(all): Figure out what to do here
        }
      }
    };

    dioApi.legislatorFormElemsByBioguideIds(bioguideIds, cb);
  };

  /**
   * Check whether or not any reps require captchas.
   * @returns {boolean}
   */
  $scope.repsUseCaptchas = function(messageResponses) {
    for (var i = 0; i < messageResponses.length; ++i) {
      if (messageResponses[i].status === 'captcha_needed') {
        return true;
      }
    }
    return false;
  };

	$scope.send = function() {

    // create JSON form submission object
    $scope.submitted = true;
    var messages = map($scope.legislators, function(legislator) {
      return helpers.makeMessage(
        legislator,
        $scope.formData,
        $scope.messageForm.phone.$viewValue,
        $scope.topicOptions,
        $scope.address
      );
    });

    var cb = function(err, messageResponses) {
      var serverErr = !isEmpty(err);

      if (!serverErr) {
        var hasCaptcha = $scope.repsUseCaptchas(messageResponses);

        dioData.setMessageResponses(messageResponses);
        if (hasCaptcha) {
          $location.path('/captcha');
        } else {
          $location.path('/thanks');
        }
      } else {
        // TODO(sina): do something here
      }
    };

    dioApi.submitMessageToReps(messages, cb);

	};

  /**
   * Set local scope values for values fetched from the session store.
   */
  $scope.setLocalData = function() {
    $scope.legislators = dioData.getSelectedLegislators();
    var legFormElements = dioData.getLegislatorsFormElements();
    var bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
    $scope.legislatorsFormElements = filter(legFormElements, function(lfe) {
      return bioguideIdsBySelection[lfe.bioguideId];
    });
    $scope.address = dioData.getCanonicalAddress();

    var formFieldData = helpers.createFormFields(
      $scope.legislatorsFormElements, $scope.legislators, $scope.address);

    $scope.countyData = formFieldData.countyData;
    $scope.topicOptions = formFieldData.topicOptions;
    $scope.formData = formFieldData.formData;
  };

  /**
   * Fetch data from the session store.
   */
  $scope.fetchDataFromStore = function() {
    var validData = dioData.hasBioguideIdsBySelection() && dioData.hasCanonicalAddress();
    var selectedBioguideIds = dioData.getSelectedBioguideIds();
    if (!validData || isEmpty(selectedBioguideIds)) {
      $scope.goBack();
    }

    if (!dioData.hasLegislatorsFormElements()) {
      $scope.fetchlegislatorFormElems(selectedBioguideIds);
    } else {
      $scope.setLocalData();
    }
  };

  $scope.fetchDataFromStore();

};

module.exports = MessageFormController;
