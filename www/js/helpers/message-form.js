/**
 * Helpers for constructing the message form and parsing its data.
 */

var findWhere = require('lodash.findwhere');
var filter = require('lodash.filter');
var forEach = require('lodash.foreach');
var isArray = require('lodash.isarray');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var keys = require('lodash.keys');
var startsWith = require('lodash.startswith');

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
 * @param addressCounty
 * @returns {Object}
 */
var parseCountyOptions = function(countyElem, addressCounty) {
  var countyOptions = countyElem.optionsHash;
  // Guess the correct county based on the address.county value
  var selectedCounty = filter(countyOptions, function(countyOption) {
    return addressCounty === countyOption || startsWith(countyOption, addressCounty);
  })[0];

  return {
    selected: isUndefined(selectedCounty) ? countyOptions[0] : selectedCounty,
    options: countyOptions
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
    parenPhone: parensPhone,
    county: formData.county
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
 * @param legislator
 * @param formData
 * @param phoneValue
 * @param topicOptions
 * @param address
 * @returns {*}
 */
var makeMessage = function(legislator, formData, phoneValue, topicOptions, address) {
  var messageInfo = makeMessageInfo(legislator, formData, topicOptions[legislator.bioguideId]);

  var msg = new models.Message({
    bioguideId: legislator.bioguideId,
    subject: messageInfo.subject,
    message: messageInfo.message,
    sender: makeSenderInfo(formData, phoneValue),
    canonicalAddress: address,
    campaign: makeCampaignInfo()
  });

  // Topic can be null, and swagger doesn't support an is nullable property afaict
  if (messageInfo.topic !== null) {
    msg.topic = messageInfo.topic;
  }

  return msg;
};


/**
 * Gets data to populate a county field from the LegislatorFormElements objects.
 *
 * NOTE: The current contact congress data shows no cases where > 1 rep for a given location supports
 *       county data in their contact form. So, find the first example of county data and use that.
 *       This will need to be updated where > 1 reps adopt county data.
 *
 * @param legislatorsFormElements
 * @param addressCounty
 */
var getCountyData = function(legislatorsFormElements, addressCounty) {
  var countyKey = '$ADDRESS_COUNTY';
  var countyElem;

  for (var i = 0, countyElemArr; i < legislatorsFormElements.length; ++i) {
    countyElemArr = /** @type {Array} */ filter(legislatorsFormElements[i].formElements, function(formElem) {
      return formElem.value === countyKey;
    });
    if (countyElemArr.length > 0) {
      countyElem = countyElemArr[0];
    }
  }

  var countyData = {};
  if (!isUndefined(countyElem)) {
    countyData = parseCountyOptions(countyElem, addressCounty);
  }

  return countyData;
};


/**
 *
 * @param legislatorsFormElements
 * @param legislators
 * @returns {{}}
 */
var getTopicOptions = function(legislatorsFormElements, legislators) {
  var topicKey = '$TOPIC';
  var topicOptions = {};

  var topicElem;
  forEach(legislatorsFormElements, function(legislatorFormElems) {
    topicElem = filter(legislatorFormElems.formElements, function(formElem) {
      return formElem.value === topicKey;
    })[0];

    if (!isUndefined(topicElem)) {
      topicElem = parseTopicOptions(
        topicElem,
        findWhere(legislators, {bioguideId: legislatorFormElems.bioguideId})
      );
      topicOptions[legislatorFormElems.bioguideId] = topicElem;
    }
  });

  return topicOptions;
};


/**
 * Create supplementary form fields from the LegislatorFormElements models.
 */
var createFormFields = function(legislatorsFormElements, legislators, address) {
  var countyData = getCountyData(legislatorsFormElements, address.county);

  return {
    countyData: countyData,
    formData: {
      prefix: 'Ms.',
      county: countyData.selected
    },
    topicOptions: getTopicOptions(legislatorsFormElements, legislators)
  };
};


module.exports.createFormFields = createFormFields;

module.exports.getCountyData = getCountyData;
module.exports.parseCountyOptions = parseCountyOptions;

module.exports.getTopicOptions = getTopicOptions;
module.exports.parseTopicOptions = parseTopicOptions;

module.exports.makeMessage = makeMessage;
module.exports.makeSenderInfo = makeSenderInfo;
module.exports.makeMessageInfo = makeMessageInfo;
module.exports.makeCampaignInfo = makeCampaignInfo;
