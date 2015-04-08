/**
 *
 */

var geoip = require('geoip-lite');
var lodash = require('lodash');
var us = require('us');

var US_STATE_ABBREVIATIONS = lodash.map(us.STATES, 'abbr');
var US_TERRITORY_ABBREVIATIONS = lodash.map(us.TERRITORIES, 'abbr');


/**
 * Fetches geodata for IPs assigned to US states or territories.
 * @param ip
 * @returns {*}
 */
var getUSCityRegionDataForIP = function(ip) {
  var geo = geoip.lookup(ip);
  // Escape hatch if geoip returns null, e.g. for 127.0.0.1
  geo = geo === null ? {} : geo;

  var queryFromUSAEligibleIP = (
    geo.country === 'US' || lodash.includes(US_TERRITORY_ABBREVIATIONS, geo.country));
  var queryFromUSState = lodash.includes(US_STATE_ABBREVIATIONS, geo.region);

  if (queryFromUSAEligibleIP) {
    return {
      region: queryFromUSState ? geo.region : null,
      city: geo.city
    };
  } else {
    return null;
  }
};


/**
 * Makes a SmartyStreets preference string from a {city: '', region: ''} object.
 * @param cityRegionData
 * @returns {string}
 */
var makePreferenceStringFromUSCityRegionData = function(cityRegionData) {
  if (lodash.isNull(cityRegionData)) {
    return null;
  } else {

  }
};


module.exports.getUSCityRegionDataForIP = getUSCityRegionDataForIP;
module.exports.makePreferenceStringFromUSCityRegionData = makePreferenceStringFromUSCityRegionData;