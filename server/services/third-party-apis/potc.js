/**
 * Helpers for interacting with the Phantom of the Capitol API.
 */

var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


/**
 * Make an appropriately configured URL for the POTC API.
 * @param pathname
 * @param params
 * @param config
 * @returns {*}
 */
var makePOTCUrl = function(pathname, config) {
  var potcURL = url.parse(config.API.POTC_BASE_URL);
  potcURL.pathname = pathname;
  potcURL.query = {'debug_key': config.CREDENTIALS.POTC.DEBUG_KEY};

  return url.format(potcURL);
};


/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 * @param repIds
 * @param config
 * @param cb
 */
var getFormElementsForRepIdsFromPOTC = function(bioguideIds, config, cb) {
  var potcURL = makePOTCUrl('retrieve-form-elements', config);
  makeRequest({method: 'POST', url: potcURL, json: true, body: {'bio_ids': bioguideIds}}, cb);
};


/**
 * Sends a message to a representative via POTC.
 * @param message
 */
var sendMessage = function(message, config, cb) {
  var potcURL = makePOTCUrl('fill-out-form', config);
  makeRequest({method: 'POST', url: potcURL, json: true, body: message}, cb);
};


/**
 * Sends a captcha solution to POTC.
 */
var solveCaptcha = function(solution, config, cb) {
  var potcURL = makePOTCUrl('fill-out-captcha', config);
  makeRequest({method: 'POST', url: potcURL, json: true, body: solution}, cb);
};


module.exports.makePOTCUrl = makePOTCUrl;
module.exports.getFormElementsForRepIdsFromPOTC = getFormElementsForRepIdsFromPOTC;
module.exports.sendMessage = sendMessage;
module.exports.solveCaptcha = solveCaptcha;