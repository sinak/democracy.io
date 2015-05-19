/**
 *
 */

var angular = require('angular');

var coerceJSONResponseToModelResponse = require('../helpers/api-helpers').coerceJSONResponseToModelResponse;


var modelHttpInterceptor = function($q) {

  return {

    response: function(response) {
      var requestOptions = response.config;

      if (!angular.isUndefined(requestOptions.modelClass)) {
        // The double .data access is due to usage of Jsend style responses on the server
        var data = response.data.data;
        response.data = coerceJSONResponseToModelResponse(data, requestOptions.modelClass);
      }

      return response;
    },

    responseError: function(rejection) {
      // TODO(leah): Update this to produce error objects
      return $q.reject(rejection);
    }

  };
};


module.exports = modelHttpInterceptor;
