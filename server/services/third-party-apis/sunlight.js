/**
 * Helpers for interacting with the Sunlight Foundation API.
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


module.exports.makeSunlightUrl = makeSunlightUrl;
module.exports.locateLegislatorsViaSunlight = locateLegislatorsViaSunlight;
module.exports.fetchActiveLegislatorBioViaSunlight = fetchActiveLegislatorBioViaSunlight;