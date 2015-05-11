/**
 *
 */

var findWhere = require('lodash.findWhere');
var filter = require('lodash.filter');
var forEach = require('lodash.forEach');
var isEmpty = require('lodash.isEmpty');
var keys = require('lodash.keys');
var map = require('lodash.map');
var pick = require('lodash.pick');


var MessageFormController = function($scope, $location, $timeout, dioData, dioApi) {
  $scope.address = dioData.getCanonicalAddress();
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
  $scope.formData = {};

  /**
   *
   * @type {{}}
   */
  $scope.countyData = {};

  /**
   *
   * @type {Array}
   */
  $scope.topicOptions = [];

  /**
   *
   * @type {Array}
   */
  $scope.formSubmissions = [];

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
        $scope.countyData = $scope.parseCountyOptions(countyElem);
      } else {
        $scope.formData.county = {
          selected: $scope.address.county
        };
      }

      topicElem = findWhere(specialOptions, {value: '$TOPIC'});
      if (!isEmpty(topicElem)) {
        topicElem = $scope.parseTopicOptions(
          topicElem,
          findWhere($scope.legislators, {bioguideId: legislatorFormElems.bioguideId})
        );
        $scope.topicOptions.push(topicElem);
      }
    });
  };

  /**
   * Parse out the topic options for a given legislator.
   * @param topicElem
   * @param legislator
   */
  $scope.parseTopicOptions = function(topicElem, legislator) {
    var options = keys(topicElem.optionsHash);

    return {
      bioguideId: legislator.bioguideId,
      name: legislator.title + '. ' + legislator.lastName,
      options: options,
      selected: options[0]
    };
  };

  /**
   * Parse out the county options from a county FormElement.
   * @param countyElem
   * @returns {{)}}
   */
  $scope.parseCountyOptions = function(countyElem) {
    // TODO(leah): Confirm that the county list is actually the same across legislators and
    //             that there's no examples of "CountyA" vs "County A" etc.

    return {
      selected: countyElem.optionsHash[0],
      options: countyElem.optionsHash
    };
  };

  var prepareFormSubmissions = function() {
    $scope.formSubmissions = [];
    $scope.formSubmissions = map($scope.legislators, function(legislator) {
      var legislatorSubmission = {
        bioguideId: legislator.bioguideId,
        fields: {}
      };

      legislatorSubmission.fields.$NAME_PREFIX = $scope.formData.prefix;
      legislatorSubmission.fields.$NAME_FIRST = $scope.formData.firstName;
      legislatorSubmission.fields.$NAME_LAST = $scope.formData.lastName;
      legislatorSubmission.fields.$NAME_FULL = $scope.formData.firstName + ' ' + $scope.formData.lastName;
      legislatorSubmission.fields.$ADDRESS_STREET =
        $scope.address.components.primaryNumber + " " +
        $scope.address.components.streetName + " " +
        $scope.address.components.streetSuffix;
      legislatorSubmission.fields.$ADDRESS_CITY = $scope.address.components.cityName;
      legislatorSubmission.fields.$ADDRESS_STATE_POSTAL_ABBREV = $scope.address.components.stateAbbreviation;
      legislatorSubmission.fields.$ADDRESS_STATE_FULL = $scope.address.components.stateName;
      legislatorSubmission.fields.$ADDRESS_COUNTY = $scope.formData.county.selected;
      legislatorSubmission.fields.$ADDRESS_ZIP5 = $scope.address.components.zipcode;
      legislatorSubmission.fields.$ADDRESS_ZIP4 = $scope.address.components.plus4Code;
      legislatorSubmission.fields.$ADDRESS_ZIP_PLUS_4 = $scope.address.components.zipcode + "-" + $scope.address.components.plus4Code;


      var phoneString = $scope.formData.phoneNumber.toString();
      var hyphenatedPhone = phoneString.slice(0,3) + '-' + phoneString.slice(3,6) + '-' + phoneString.slice(6);
      var parensPhone = '(' + phoneString.slice(0,3) + ') ' + phoneString.slice(3,6) + '-' + phoneString.slice(6);
      legislatorSubmission.fields.$PHONE = hyphenatedPhone;
      legislatorSubmission.fields.$PHONE_PARENTHESES = parensPhone;

      legislatorSubmission.fields.$EMAIL = $scope.formData.email;

      var selectedTopic = findWhere($scope.topicOptions, {bioguideId: legislator.bioguideId});
      if (!angular.isUndefined(selectedTopic)) {
        var legislatorForm = findWhere($scope.legislatorsFormElements, {bioguideId: legislator.bioguideId});
        var topicsList = findWhere(legislatorForm.formElements, {value: '$TOPIC'});
        var topicValue = topicsList.optionsHash[selectedTopic.selected];

        legislatorSubmission.fields.$TOPIC = topicValue;
      } else {
        legislatorSubmission.fields.$TOPIC = null;
      }

      legislatorSubmission.fields.$SUBJECT = $scope.formData.subject;
      legislatorSubmission.fields.$MESSAGE = (
        'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' +
         $scope.formData.message
      );
      legislatorSubmission.fields.$CAMPAIGN_UUID = ''; //TODO
      legislatorSubmission.fields.$ORG_URL = ''; //TODO
      legislatorSubmission.fields.$ORG_NAME = ''; //TODO

      return legislatorSubmission;
    })
  };

	$scope.send = function(repData) {

    // create JSON form submission object
    $scope.submitted = true;
    $scope.formSubmissions = prepareFormSubmissions();

    if ($scope.joinEmailList) {
      // TODO add to eff email list
      // $scope.formData.email
    }

    var cb = function(data) {
      //TODO - hand off to CAPTCHA controller
    };

    dioApi.submitMessageToReps($scope.formSubmissions, cb);

    if ($scope.hasCaptcha) {
      $location.path('/capcha');
    } else {
      $location.path('/thanks');
    }
	};

  $scope.setLocalData = function() {
    $scope.legislators = dioData.getSelectedLegislators();
    $scope.bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
    $scope.legislatorsFormElements = dioData.getLegislatorsFormElements();

    $scope.hasCaptcha = $scope.legislatorsUseCaptchas();
    $scope.createFormFields();
  };

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

module.exports = MessageFormController;
