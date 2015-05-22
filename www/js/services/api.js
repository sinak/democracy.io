/**
 * API service for the Democracy.io app.
 */

var helpers = require('../helpers/api');
var models = require('../../../models');
var forEach = require('lodash.forEach');

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    makeRelativeAPIURL: function(path) {
      return helpers.makeRelativeAPIUrl(siteConfig.API_BASE_URL, siteConfig.API_VERSION, path);
    },

    makeAPICall: function(opts, cb) {
      opts.apiCall = true;
      $http(opts)
        .success(function(data) {
          cb(null, data);
        })
        .error(function(data, status, headers, config) {
          cb(data, null);
        });
    },

    verifyAddress: function(address, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('location/verify'),
        method: 'GET',
        params: {address: address},
        modelClass: models.CanonicalAddress
      };

      this.makeAPICall(opts, cb);
    },

    /**
     *
     * @param lat
     * @param lng
     */
    findLegislatorsByLatLng: function(lat, lng, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('/legislators/findByLatLng'),
        method: 'GET',
        params: {latitude: lat, longitude: lng},
        modelClass: models.Legislator
      };

      this.makeAPICall(opts, cb);
    },

    legislatorFormElemsByBioguideIds: function(bioguideIds, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('/formElements/findByLegislatorBioguideIds'),
        method: 'GET',
        params: {bioguideIds: bioguideIds},
        modelClass: models.LegislatorFormElements
      };

      this.makeAPICall(opts, cb);
    },

    /**
     *
     */
    submitMessageToReps: function(messages, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('/legislators/message'),
        method: 'POST',
        data: messages,
        modelClass: models.MessageResponse
      };

      this.makeAPICall(opts, cb);
    },

    /**
     *
     */
    submitCaptchaResponse: function(captchaSolution, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('captchaSolution'),
        method: 'POST',
        data: captchaSolution
      };

      this.makeAPICall(opts, cb);
    }

  };

};

module.exports = ['$http', 'dioConfig', api];
