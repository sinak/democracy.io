/**
 *
 */

var map = require('lodash.map');


/**
 * Construct a relative, versioned API URL from an URL path.
 * @param urlSuffix
 * @returns {string}
 */
var makeAPIUrl = function(apiBaseUrl, apiVersion, urlSuffix) {
  var url = [apiBaseUrl, apiVersion, urlSuffix].join('/');
  return url.replace('//', '/');
};


/**
 *
 * @param jsonData
 * @param modelClass
 * @returns {*}
 */
var coerceJSONResponseToModelResponse = function(jsonData, modelClass) {
 if (angular.isArray(jsonData)) {
    return map(jsonData, function(modelData) {
      return new modelClass(modelData);
    });
  } else {
    return new modelClass(jsonData);
  }
};


module.exports.makeAPIUrl = makeAPIUrl;
module.exports.coerceJSONResponseToModelResponse = coerceJSONResponseToModelResponse;