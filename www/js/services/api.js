/**
 * API service for the Democracy.io app.
 */

var helpers = require('../helpers/api_helpers');
var models = require('../../../models');

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    makeAPICall: function(opts, cb) {
      $http(opts)
        .success(function(data) {
          cb(data);
        })
        .error(function(data, status, headers, config) {
          // TODO(leah): Get a reasonable err msg out of this.
        });
    },

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

      this.makeAPICall(opts, cb);
    },

    legislatorFormElementsByBioguideIds: function(bioguideIds, cb) {
      var opts = {
        url: helpers.makeAPIUrl(
          siteConfig.API_BASE_URL, siteConfig.API_VERSION, '/formElements/findByLegislatorBioguideIds'),
        method: 'GET',
        params: {bioguideIds: bioguideIds},
        modelClass: models.LegislatorFormElements
      };

      this.makeAPICall(opts, cb);
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
