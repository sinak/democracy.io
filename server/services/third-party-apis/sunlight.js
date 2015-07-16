/**
 * Helpers for interacting with the Sunlight Foundation API.
 */

var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


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
 * Finds members of the US Congress by lat / lng from the Sunlight Legislators API.
 * @param lat
 * @param lng
 * @param config
 * @param cb
 */
var locateLegislatorsViaSunlight = function(locQuery, config, cb) {
  var sunlightUrl = makeSunlightUrl('/legislators/locate', locQuery, config);
  makeRequest({method: 'GET', url: sunlightUrl, json: true}, cb);
};


/**
 * Finds the US Congressional Rep matching the supplied bioguideId, assuming they're in office.
 * @param bioguideId
 * @param config
 * @param cb
 */
var fetchActiveLegislatorBioViaSunlight = function(bioguideId, config, cb) {
  var sunlightUrl = makeSunlightUrl('/legislators', {'bioguide_id': bioguideId}, config);
  makeRequest({method: 'GET', url: sunlightUrl, json: true}, cb);
};


module.exports.makeSunlightUrl = makeSunlightUrl;
module.exports.locateLegislatorsViaSunlight = locateLegislatorsViaSunlight;
module.exports.fetchActiveLegislatorBioViaSunlight = fetchActiveLegislatorBioViaSunlight;
