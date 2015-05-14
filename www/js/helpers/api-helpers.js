/**
 *
 */

var map = require('lodash.map');
var isArray = require('lodash.isArray');


/**
 * Construct a relative, versioned API URL from an URL path.
 * @param urlSuffix
 * @returns {string}
 */
var makeRelativeAPIUrl = function(apiBaseUrl, apiVersion, urlSuffix) {
  var url = [apiBaseUrl, apiVersion, urlSuffix].join('/');
  url = url.replace(/\/\//g, '/');
  return url.indexOf('/') === 0 ? url : '/' + url;
};


/**
 *
 * @param jsonData
 * @param modelClass
 * @returns {*}
 */
var coerceJSONResponseToModelResponse = function(jsonData, modelClass) {
 if (isArray(jsonData)) {
    return map(jsonData, function(modelData) {
      return new modelClass(modelData);
    });
  } else {
    return new modelClass(jsonData);
  }
};


module.exports.makeRelativeAPIUrl = makeRelativeAPIUrl;
module.exports.coerceJSONResponseToModelResponse = coerceJSONResponseToModelResponse;
