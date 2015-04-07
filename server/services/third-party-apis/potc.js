/**
 * Helpers for interacting with the Phantom of the Capitol API.
 */

var path = require('path');
var url = require('url');
var request = require('request');


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
  var jsonBody = {'bio_ids': bioguideIds};
  request.post({url: potcURL, json: true, body: jsonBody}, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      cb(body, null);
    } else {
      cb(null, err);
    }
  });
};


module.exports.makePOTCUrl = makePOTCUrl;
module.exports.getFormElementsForRepIdsFromPOTC = getFormElementsForRepIdsFromPOTC;