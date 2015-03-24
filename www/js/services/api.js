/**
 * API service for the Democracy.io app.
 */

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    /**
     *
     * @param lat
     * @param lng
     */
    getRepsByLocation: function(lat, lng, cb) {
      $http.get(this.makeAPIUrl('representatives'), {params: {lat: lat, lng: lng}})
        .success(function(data) {
          cb(data);
        })
        .error(function(data, status, headers, config) {
          // TODO(leah): Get a reasonable err msg out of this.
        });
    },

    getRepsById: function(repIds) {

    },

    /**
     *
     */
    submitMessageToReps: function() {

    },

    /**
     *
     */
    submitCaptchaResponse: function() {

    },

    /**
     * Construct a relative, versioned API URL from an URL path.
     * @param urlSuffix
     * @returns {string}
     */
    makeAPIUrl: function(urlSuffix) {
      var url = [siteConfig.API_BASE_URL, siteConfig.API_VERSION, urlSuffix].join('/');
      return url.replace('//', '/');
    }

  };

};

module.exports = api;
