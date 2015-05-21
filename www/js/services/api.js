/**
 * API service for the Democracy.io app.
 */

var helpers = require('../helpers/api-helpers');
var models = require('../../../models');
var forEach = require('lodash.forEach');

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    makeRelativeAPIURL: function(path) {
      return helpers.makeRelativeAPIUrl(siteConfig.API_BASE_URL, siteConfig.API_VERSION, path);
    },

    makeAPICall: function(opts, cb) {
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
        withCredentials: true,
        data: messages
      };

      console.log(JSON.stringify(messages));
      this.makeAPICall(opts, cb);
    },

    /**
     *
     */
    submitCaptchaResponse: function(uid, answer, cb) {
      var opts = {
        url: this.makeRelativeAPIURL(''), //TODO
        method: 'POST',
        params: {answer: answer, uid: uid}
      };

      //this.makeAPICall(opts, cb); TODO
    }

  };

};

module.exports = ['$http', 'dioConfig', api];
