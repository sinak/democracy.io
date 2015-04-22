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

  $scope.formData = {};
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
   
    $scope.countyOptions = [];
    $scope.topicOptions = [];

    forEach($scope.legislatorsFormElements, function(legislatorForm){

      // Assemble County Options
      var newCountyOptions = findWhere(legislatorForm.formElements, {'value': '$ADDRESS_COUNTY'});

      $scope.formData.county = {
        selected: '',
        options: ''
      }

      if (!angular.isUndefined(newCountyOptions)){
        var countyOptions = newCountyOptions.optionsHash;

        //TODO logic for fuzzy matching county

        if (!$scope.formData.county.selected) {
          $scope.formData.county.options = countyOptions;
        }
      }

      // Assemble Topic Options
      var newTopicOptions = findWhere(legislatorForm.formElements, {'value': '$TOPIC'});

      if (!angular.isUndefined(newTopicOptions)){
        var legislatorDetails = findWhere($scope.legislators, {'bioguideId': legislatorForm.bioguideId});
        var optionName = legislatorDetails.title + ". " + legislatorDetails.lastName;

        $scope.topicOptions.push({
          bio_id: legislatorForm.bioguideId,
          name: optionName,
          options: Object.keys(newTopicOptions.optionsHash),
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
      legislatorSubmission.fields.$ADDRESS_COUNTY = $scope.formData.county.selected;
      legislatorSubmission.fields.$ADDRESS_ZIP5 = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_ZIP4 = ''; //TODO
      legislatorSubmission.fields.$ADDRESS_ZIP_PLUS_4 = ''; //TODO
      

      var phoneString = $scope.formData.phoneNumber.toString();
      var hyphenatedPhone = phoneString.slice(0,3) + "-" + phoneString.slice(3,6) + "-" + phoneString.slice(6);
      var parensPhone = "(" + phoneString.slice(0,3) + ") " + phoneString.slice(3,6) + "-" + phoneString.slice(6);
      legislatorSubmission.fields.$PHONE = hyphenatedPhone;
      legislatorSubmission.fields.$PHONE_PARENTHESES = parensPhone;

      legislatorSubmission.fields.$EMAIL = $scope.formData.email;
      
      var selectedTopic = findWhere($scope.topicOptions, {'bio_id':legislator.bioguideId});
      if (!angular.isUndefined(selectedTopic)) {
        var legislatorForm = findWhere($scope.legislatorsFormElements, {'bioguideId': legislator.bioguideId});
        var topicsList = findWhere(legislatorForm.formElements, {'value:': '$TOPIC'});
        var topicValue = topicsList.optionsHash[selectedTopic.selected];

        legislatorSubmission.fields.$TOPIC = topicValue;
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

    var cb = function(data){
      //TODO - hand off to CAPTCHA controller
    }

    dioApi.submitMessageToReps($scope.formSubmissions, cb);

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
