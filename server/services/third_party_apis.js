/**
 * Helpers for calling third party APIs.
 */

var path = require('path');
var url = require('url');
var request = require('request');


var makeSunlightUrl = function(latitude, longitude, config) {
  var sunlightUrl = url.parse(config.API.SUNLIGHT_BASE_URL);
  sunlightUrl.pathname = '/legislators/locate';
  sunlightUrl.query = {
    latitude: latitude,
    longitude: longitude,
    apikey: config.CREDENTIALS.SUNLIGHT.API_KEY
  };

  return url.format(sunlightUrl);
};

/**
 * Finds members of the US Congress by lat / lng from the Sunglight Legislators API.
 * @param latitude
 * @param longitude
 * @param config
 * @param cb
 */
var locateLegislatorsViaSunlight = function(latitude, longitude, config, cb) {
  var sunlightUrl = makeSunlightUrl(latitude, longitude, config);

  request({url: sunlightUrl, json: true}, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      cb(body, null);
    } else {
      cb(null, err);
    }
  });
};



module.exports.locateLegislatorsViaSunlight = locateLegislatorsViaSunlight;
