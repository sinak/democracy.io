/**
 *
 */

var angular = require('angular');

var Error = require('../../../models').Error;
var coerceJSONResponseToModelResponse = require('../helpers/api-helpers').coerceJSONResponseToModelResponse;


var modelHttpInterceptor = function($q) {

  return {

    response: function(response) {
      var requestOptions = response.config;

      if (requestOptions.apiCall) {
        // The double .data access is due to usage of JSend style responses on the server
        var data = response.data.data;
        if (!angular.isUndefined(requestOptions.modelClass)) {
          response.data = coerceJSONResponseToModelResponse(data, requestOptions.modelClass);
        }
      }

      return response;
    },

    responseError: function(rejection) {
      rejection.data = coerceJSONResponseToModelResponse(rejection.data, Error);
      return $q.reject(rejection);
    }

  };
};


module.exports = modelHttpInterceptor;
