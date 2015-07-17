/**
 * Helpers for interacting with the Phantom of the Capitol API.
 */

var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


/**
 * Make an appropriately configured URL for the POTC API.
 * @param pathname
 * @param baseURL
 * @param debugKey
 * @returns {*}
 */
var makePOTCUrl = function(pathname, baseURL, debugKey) {
  var potcURL = url.parse(baseURL);
  potcURL.pathname = pathname;
  potcURL.query = {'debug_key': debugKey};

  return url.format(potcURL);
};


/**
 * Fetches form elements for the supplied repIds from Phantom of the Capitol.
 * @param bioguideIds
 * @param config
 * @param cb
 */
var getFormElementsForRepIdsFromPOTC = function(bioguideIds, config, cb) {
  var potcURL = makePOTCUrl(
    'retrieve-form-elements',
    config.get('API.POTC_BASE_URL'),
    config.get('CREDENTIALS.POTC.DEBUG_KEY')
  );
  makeRequest({method: 'POST', url: potcURL, json: true, body: {'bio_ids': bioguideIds}}, cb);
};


/**
 * Sends a message to a representative via POTC.
 * @param message
 * @param config
 * @param cb
 */
var sendMessage = function(message, config, cb) {
  var potcURL = makePOTCUrl(
    'fill-out-form',
    config.get('API.POTC_BASE_URL'),
    config.get('CREDENTIALS.POTC.DEBUG_KEY')
  );
  makeRequest({method: 'POST', url: potcURL, json: true, body: message}, cb);
};


/**
 * Sends a captcha solution to POTC.
 */
var solveCaptcha = function(solution, config, cb) {
  var potcURL = makePOTCUrl(
    'fill-out-captcha',
    config.get('API.POTC_BASE_URL'),
    config.get('CREDENTIALS.POTC.DEBUG_KEY')
  );
  makeRequest({method: 'POST', url: potcURL, json: true, body: solution}, cb);
};


module.exports.makePOTCUrl = makePOTCUrl;
module.exports.getFormElementsForRepIdsFromPOTC = getFormElementsForRepIdsFromPOTC;
module.exports.sendMessage = sendMessage;
module.exports.solveCaptcha = solveCaptcha;
