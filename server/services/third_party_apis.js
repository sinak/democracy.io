/**
 * Helpers for calling third party APIs.
 */

var path = require('path');
var url = require('url');
var request = require('request');


/**
 * Make an appropriately configured URL for the Sunlight API.
 * @param pathname
 * @param params
 * @param config
 * @returns {*}
 */
var makeSunlightUrl = function(pathname, params, config) {
  var sunlightUrl = url.parse(config.API.SUNLIGHT_BASE_URL);
  sunlightUrl.pathname = pathname;

  params.apikey = config.CREDENTIALS.SUNLIGHT.API_KEY;
  sunlightUrl.query = params;

  return url.format(sunlightUrl);
};


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
 * Finds members of the US Congress by lat / lng from the Sunglight Legislators API.
 * @param lat
 * @param lng
 * @param config
 * @param cb
 */
var locateLegislatorsViaSunlight = function(lat, lng, config, cb) {
  var sunlightUrl = makeSunlightUrl('/legislators/locate', {latitude: lat, longitude: lng}, config);

  request({url: sunlightUrl, json: true}, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      cb(body, null);
    } else {
      cb(null, err);
    }
  });
};


/**
 * Finds the US Congressional Rep matching the supplied bioguideId, assuming they're in office.
 * @param bioguideId
 * @param config
 * @param cb
 */
var fetchActiveLegislatorBioViaSunlight = function(bioguideId, config, cb) {
  var sunlightUrl = makeSunlightUrl('/legislators', {'bioguide_id': bioguideId}, config);

  request({url: sunlightUrl, json: true}, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      cb(body, null);
    } else {
      cb(null, err);
    }
  });
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


module.exports.locateLegislatorsViaSunlight = locateLegislatorsViaSunlight;
module.exports.fetchActiveLegislatorBioViaSunlight = fetchActiveLegislatorBioViaSunlight;
module.exports.getFormElementsForRepIdsFromPOTC = getFormElementsForRepIdsFromPOTC;