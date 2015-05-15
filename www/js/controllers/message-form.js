/**
 *
 */

var findWhere = require('lodash.findWhere');
var filter = require('lodash.filter');
var forEach = require('lodash.forEach');
var isArray = require('lodash.isArray');
var isEmpty = require('lodash.isEmpty');
var isUndefined = require('lodash.isUndefined');
var keys = require('lodash.keys');
var map = require('lodash.map');
var pick = require('lodash.pick');

var helpers = require('../helpers/message-form');


var MessageFormController = function($scope, $location, $timeout, dioData, dioApi) {
  $scope.loadingDelay = true;
  $scope.submitted = false;
  $scope.joinEmailList = false;

  $timeout(function() {
    $scope.loadingDelay = false;
  }, 350);

  $scope.goBack = function(){
    if (dioData.hasCanonicalAddress) {
      $location.path('/location');
    } else {
      $location.path('/');
    }
  };

  /**
   * Whether any of the legislators to message require captchas.
   * @type {boolean}
   */
  $scope.hasCaptcha = false;

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
    if (!isEmpty(bioguideIds)) {
      var cb = function(legislatorsFormElements) {
        dioData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLocalData();
      };

      dioApi.legislatorFormElemsByBioguideIds(bioguideIds, cb);
    } else {
      // TODO(leah): Skip back a page, unless we implement a more generic approach.
    }
  };

  /**
   * Check whether or not any legislators require captchas.
   * @returns {boolean}
   */
  $scope.legislatorsUseCaptchas = function() {
    for (var i = 0; i < $scope.legislatorsFormElements.length; ++i) {
      if ($scope.legislatorsFormElements[i].requiresCaptcha()) {
        return true;
      }
    }
    return false;
  };

  /**
   * Create supplementary form fields from the LegislatorFormElements models.
   */
  $scope.createFormFields = function() {

    var specialOptionKeys = [
      '$ADDRESS_COUNTY',
      '$TOPIC'
    ];

    var topicElem, countyElem, specialOptions;
    forEach($scope.legislatorsFormElements, function(legislatorFormElems) {

      specialOptions = filter(legislatorFormElems.formElements, function(formElem) {
        return specialOptionKeys.indexOf(formElem.value) !== -1;
      });

      countyElem = findWhere(specialOptions, {value: '$ADDRESS_COUNTY'});
      if (isEmpty($scope.countyData) && !isEmpty(countyElem)) {
        $scope.countyData = helpers.parseCountyOptions(countyElem);
      } else {
        $scope.formData.county = {
          selected: $scope.address.county
        };
      }

      topicElem = findWhere(specialOptions, {value: '$TOPIC'});
      if (!isEmpty(topicElem)) {
        topicElem = helpers.parseTopicOptions(
          topicElem,
          findWhere($scope.legislators, {bioguideId: legislatorFormElems.bioguideId})
        );
        $scope.topicOptions[legislatorFormElems.bioguideId] = topicElem;
      }
    });
  };

	$scope.send = function(repData) {

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

    if ($scope.joinEmailList) {
      // TODO add to eff email list
      // $scope.formData.email
    }

    var cb = function(data) {
      // TODO - hand off to CAPTCHA controller
    };

    dioApi.submitMessageToReps(messages, cb);

    if ($scope.hasCaptcha) {
      $location.path('/captcha');
    } else {
      $location.path('/thanks');
    }
	};

  // TODO(leah): Nitpicks:
  //   * wire up the error fields to use better show conditions, so the phone err msg etc doesn't immediately show on typing

  /**
   * Set local scope values for values fetched from the session store.
   */
  $scope.setLocalData = function() {
    $scope.legislators = dioData.getSelectedLegislators();
    $scope.bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
    $scope.legislatorsFormElements = dioData.getLegislatorsFormElements();
    $scope.address = dioData.getCanonicalAddress();

    $scope.hasCaptcha = $scope.legislatorsUseCaptchas();
    $scope.createFormFields();
  };


  /**
   * Fetch data from the session store.
   */
  $scope.fetchDataFromStore = function() {
    if (!dioData.hasCanonicalAddress()){
      $location.path('/');
    }

    if (!dioData.hasLegislatorsFormElements()) {
      var bioguideIds = keys(pick(dioData.getBioguideIdsBySelection(), function(val) {
        return val;
      }));
      $scope.fetchlegislatorFormElems(bioguideIds);
    } else {
      $scope.setLocalData();
    }
  };

  $scope.fetchDataFromStore();

};

module.exports = MessageFormController;
