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
    findLegislatorsByLatLng: function(lat, lng, cb) {
      var params = {params: {latitude: lat, longitude: lng}};
      $http.get(this.makeAPIUrl('/legislators/findByLatLng'), params)
        .success(function(data) {
          cb(data);
        })
        .error(function(data, status, headers, config) {
          // TODO(leah): Get a reasonable err msg out of this.
        });
    },

    legislatorFormElementsByBioguideIds: function(bioguideIds) {

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
