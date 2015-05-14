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
    fullName: formData.firstName + ' ' + formData.lastName,
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
 * @returns {{campaignUUID: string, orgURL: string, orgName: string}}
 */
var makeCampaignInfo = function() {

  return {
    campaignUUID: '',
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
 * @returns {*}
 */
var makeMessages = function(legislators, formData, phoneValue, topicOptions) {
  var messages = map(legislators, function(legislator) {
    var legislatorSubmission = {
      bioguideId: legislator.bioguideId
    };

    var senderInfo = helpers.makeSenderInfo(formData, phoneValue);

    var messageInfo = helpers.makeMessageInfo(
      legislator, formData, topicOptions[legislator.bioguideId]);

    var campaignInfo = helpers.makeCampaignInfo();

    return legislatorSubmission;
  });

  return messages;
};


module.exports.parseTopicOptions = parseTopicOptions;
module.exports.parseCountyOptions = parseCountyOptions;
module.exports.makeMessages = makeMessages;
module.exports.makeSenderInfo = makeSenderInfo;
module.exports.makeMessageInfo = makeMessageInfo;
module.exports.makeCampaignInfo = makeCampaignInfo;