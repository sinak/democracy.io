/**
 * API service for the Democracy.io app.
 */

var helpers = require('../helpers/api_helpers');
var models = require('../../../models');

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    /**
     *
     * @param lat
     * @param lng
     */
    findLegislatorsByLatLng: function(lat, lng, cb) {
      var opts = {
        url: helpers.makeAPIUrl(
          siteConfig.API_BASE_URL, siteConfig.API_VERSION, '/legislators/findByLatLng'),
        method: 'GET',
        params: {latitude: lat, longitude: lng},
        modelClass: models.Legislator
      };

      $http(opts)
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

    }

  };

};

module.exports = api;
