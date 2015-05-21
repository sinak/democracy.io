/**
 * Helpers for construction the message form and parsing its data.
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

var models = require('../../../models');


/**
 * Parse out the topic options for a given legislator.
 * @param topicElem
 * @param legislator
 */
var parseTopicOptions = function(topicElem, legislator) {
  var options = isArray(topicElem.optionsHash) ?
    topicElem.optionsHash : keys(topicElem.optionsHash);

  return {
    bioguideId: legislator.bioguideId,
    name: legislator.title + '. ' + legislator.lastName,
    options: options,
    optionsHash: topicElem.optionsHash,
    selected: options[0]
  };
};


/**
 * Parse out the county options from a county FormElement.
 * @param countyElem
 * @returns {{)}}
 */
var parseCountyOptions = function(countyElem) {
  // TODO(leah): Confirm that the county list is actually the same across legislators and
  //             that there's no examples of "CountyA" vs "County A" etc.

  return {
    selected: countyElem.optionsHash[0],
    options: countyElem.optionsHash
  };
};


/**
 *
 * @returns {{}}
 */
var makeSenderInfo = function(formData, parensPhone) {

  return {
    namePrefix: formData.prefix,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: parensPhone.replace('(', '').replace(')', '').replace(' ', '-'),
    parenPhone: parensPhone
  };

};


/**
 *
 * @param legislator
 * @param formData
 * @param topic An object describing the topics for a legislator, as created by parseTopicOptions.
 * @returns {{}}
 */
var makeMessageInfo = function(legislator, formData, topic) {

  var topicValue = null;
  if (!isUndefined(topic)) {
    topicValue = isArray(topic.optionsHash) ?
      topic.selected : topic.optionsHash[topic.selected];
  }

  return {
    topic: topicValue,
    subject: formData.subject,
    message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
  };

};


/**
 *
 * @returns {{}}
 */
var makeCampaignInfo = function() {

  return {
    uuid: '',
    orgURL: '',
    orgName: ''
  };

};


/**
 *
 * @param legislators
 * @param formData
 * @param phoneValue
 * @param topicOptions
 * @param address
 * @returns {*}
 */
var makeMessage = function(legislator, formData, phoneValue, topicOptions, address) {
  var messageInfo = makeMessageInfo(legislator, formData, topicOptions[legislator.bioguideId]);

  return new models.Message({
    bioguideId: legislator.bioguideId,
    topic: messageInfo.topic,
    subject: messageInfo.subject,
    message: messageInfo.message,
    sender: makeSenderInfo(formData, phoneValue),
    canonicalAddress: address,
    campaign: makeCampaignInfo()
  });
};


/**
 * Create supplementary form fields from the LegislatorFormElements models.
 */
var createFormFields = function(legislatorsFormElements, legislators, countyData, address) {

  var formFieldData = {
    countyData: {},
    formData: {},
    topicOptions: {}
  };

  var specialOptionKeys = [
    '$ADDRESS_COUNTY',
    '$TOPIC'
  ];

  var topicElem, countyElem, specialOptions;
  forEach(legislatorsFormElements, function(legislatorFormElems) {

    specialOptions = filter(legislatorFormElems.formElements, function(formElem) {
      return specialOptionKeys.indexOf(formElem.value) !== -1;
    });

    // TODO(leah): This seems wrong. Not clear that canonicalAddress.country is really the right thing
    //             to grab here.
    countyElem = findWhere(specialOptions, {value: '$ADDRESS_COUNTY'});
    if (isEmpty(countyData) && !isEmpty(countyElem)) {
      formFieldData.countyData = parseCountyOptions(countyElem);
    } else {
      formFieldData.formData.county = {
        selected: address.county
      };
    }

    topicElem = findWhere(specialOptions, {value: '$TOPIC'});
    if (!isEmpty(topicElem)) {
      topicElem = parseTopicOptions(
        topicElem,
        findWhere(legislators, {bioguideId: legislatorFormElems.bioguideId})
      );
      formFieldData.topicOptions[legislatorFormElems.bioguideId] = topicElem;
    }
  });
};


module.exports.createFormFields = createFormFields;
module.exports.parseTopicOptions = parseTopicOptions;
module.exports.parseCountyOptions = parseCountyOptions;
module.exports.makeMessage = makeMessage;
module.exports.makeSenderInfo = makeSenderInfo;
module.exports.makeMessageInfo = makeMessageInfo;
module.exports.makeCampaignInfo = makeCampaignInfo;