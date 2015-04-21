/**
 *
 */

var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');
var forEach = require('lodash.forEach');
var findWhere = require('lodash.findWhere')

var MessageFormController = function($scope, $location, $timeout, dioLegislatorData, dioApi) {

  $scope.loadingDelay = true;
  $scope.submitted = false;
  $scope.joinEmailList = false;
  
  $timeout(function(){
      $scope.loadingDelay = false;
    },
    350);

	//TODO fill out list of topics
	$scope.topics = [
		'Agriculture',
		'Technology'
	];

  $scope.formData = {
    /*'$NAME_FIRST': {
      'label': 'First Name',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$NAME_LAST': {
      'label': 'Last Name',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$SUBJECT': {
      'label': 'Subject',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$MESSAGE': {
      'label': 'Message',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$PREFIX': {
      'label': 'Prefix',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$ADDRESS_STREET': {
      'label': 'Address',
      'maxlength': null,
      'value': '',
      'options_hash': null
    },
    '$ADDRESS_ZIP5': {
      'lable': 'Zip5',
      'maxlength': 5,
      'value': '',
      'options_hash': null
    }*/
  };
  $scope.formSubmissions = [];

  var attemptToFetchLegislatorData = function(params) {
    if (!angular.isUndefined(params.lat) && !angular.isUndefined(params.lng)) {
      var cb = function(legislators) {
        dioLegislatorData.setLegislators(legislators);
        $scope.setLegislators();
      };
      dioApi.findLegislatorsByLatLng(params.lat, params.lng, cb);
    } else {
      // send back
    }
  };

  var attemptToFetchLegislatorForm = function(selectedBioguideIds) {
    var selectedBioguideIds = map(dioLegislatorData.getSelectedLegislators(), function(legislator) {
      return legislator.bioguideId;
    });

    if (!isEmpty(selectedBioguideIds)){
      var cb = function(legislatorsFormElements) {
        dioLegislatorData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLegislatorForm();
      };

      dioApi.legislatorFormElementsByBioguideIds(selectedBioguideIds, cb);
    } else {
      // TEMPORARY STUB FOR EASIER CODING
      selectedBioguideIds = ["P000197", "B000711", "F000062"]

      var cb = function(legislatorsFormElements) {
        dioLegislatorData.setLegislatorsFormElements(legislatorsFormElements);
        $scope.setLegislatorForm();
      };

      dioApi.legislatorFormElementsByBioguideIds(selectedBioguideIds, cb);

      // END TEMPORARY STUB

      // go back code
    }
  };

  var checkForCaptcha = function(){
    var hasCaptcha = false;
    forEach($scope.legislatorsFormElements, function(legislator){
      forEach(legislator.formElements, function(element){
        if (element.value === "$CAPTCHA_SOLUTION") {
          hasCaptcha = true;
        };
      });
    });

    return hasCaptcha;
  };

  $scope.setLegislators = function() {
    $scope.legislators = dioLegislatorData.getSelectedLegislators();
    $scope.selectedLegislators = dioLegislatorData.selectedLegislators;
    console.log('legislators:', $scope.legislators);
    console.log('selected legislators:', $scope.selectedLegislators);
  };

  $scope.setLegislatorForm = function () {
    $scope.legislatorsFormElements = dioLegislatorData.getLegislatorsFormElements();
    console.log('form elements:', $scope.legislatorsFormElements);
    $scope.createFormFields();
  };

  $scope.createFormFields = function (){
    // check for county TODO

    //grab different topic options
    $scope.topicOptions = [];

    forEach($scope.legislatorsFormElements, function(legislatorForm){
      var newOptions = findWhere(legislatorForm.formElements, {'value': '$TOPIC'});

      if (!angular.isUndefined(newOptions)){
        var legislatorDetails = findWhere($scope.legislators, {'bioguideId': legislatorForm.bioguideId});
        var optionName = legislatorDetails.title + ". " + legislatorDetails.lastName;

        $scope.topicOptions.push({
          bio_id: legislatorForm.bioguideId,
          name: optionName,
          options: Object.keys(newOptions.optionsHash),
          selected: ''
        });
      } 
      
    });

    console.log('topic options:', $scope.topicOptions)
  };

  var prepareFormSubmissions = function(){
    $scope.formSubmissions = [];
    $scope.formSubmissions = map($scope.legislators, function(legislator){
      var legislatorSubmission = {
        "bio_id": legislator.bioguideId,
        "fields": {}
      };

      legislatorSubmission.fields.$NAME_PREFIX = $scope.formData.prefix;
      legislatorSubmission.fields.$NAME_FIRST = $scope.formData.firstName;
      legislatorSubmission.fields.$NAME_LAST = $scope.formData.lastName;
      legislatorSubmission.fields.$NAME_FULL = $scope.formData.firstName + " " + $scope.formData.lastName;
      legislatorSubmission.fields.$ADDRESS_STREET = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_CITY = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_STATE_POSTAL_ABBREV = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_STATE_FULL = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_COUNTY = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_ZIP5 = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_ZIP4 = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_ZIP_PLUS_4 = ''; //TODO
      legislatorSubmission.fields.$PHONE = ''; //TODO
      legislatorSubmission.fields.$PHONE_PARENTHESES = ''; //TODO
      legislatorSubmission.fields.$EMAIL = $scope.formData.email;
      
      var selectedTopic = findWhere($scope.topicOptions ,{'bio_id':legislator.bioguideId})
      if (!angular.isUndefined(selectedTopic)) {
        legislatorSubmission.fields.$TOPIC = selectedTopic.selected;
      } else {
        legislatorSubmission.fields.$TOPIC = null;
      }

      legislatorSubmission.fields.$SUBJECT = $scope.formData.subject;
      legislatorSubmission.fields.$MESSAGE = "Dear " + legislator.title + " " + legislator.lastName + ", \n" + $scope.formData.message;
      legislatorSubmission.fields.$CAMPAIGN_UUID = ''; //TODO
      legislatorSubmission.fields.$ORG_URL = ''; //TODO
      legislatorSubmission.fields.$ORG_NAME = ''; //TODO
      
      return legislatorSubmission;
    })
  };

	$scope.send = function(repData){
    
    //create JSON form submission object
    $scope.submitted = true;
    $scope.formSubmissions = prepareFormSubmissions();

    if ($scope.joinEmailList) {
      // TODO add to eff email list
      // $scope.formData.email
    }

    dioApi.submitMessageToReps($scope.formSubmissions);

    if ($scope.hasCaptcha){
      $location.path('/capcha');
    } else {
      
      $location.path('/thanks');
    };
	};

  //ON PAGE LOAD:

  // check if they started at the beginning and populate legislator data
  if (isEmpty(dioLegislatorData.legislators) || isEmpty(dioLegislatorData.selectedLegislators)) {
    attemptToFetchLegislatorData($location.search());
  } else {
    $scope.setLegislators();
  }

  var selectedBioguideIds = map(dioLegislatorData.getSelectedLegislators(), function(legislator) {
      return legislator.bioguideId;
  });

  if (isEmpty(dioLegislatorData.legislatorsFormElements)) {
    attemptToFetchLegislatorForm(selectedBioguideIds);
  } else {
    $scope.setLegislatorForm();
  }

  $scope.hasCaptcha = checkForCaptcha();
};

module.exports = MessageFormController;
