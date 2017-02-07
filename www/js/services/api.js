/**
 * API service for the Democracy.io app.
 */

var helpers = require('../helpers/api');
var models = require('../../../models');

var api = function ($http, dioConfig) {

  var siteConfig = dioConfig.SITE;

  return {

    makeRelativeAPIURL: function(path) {
      return helpers.makeRelativeAPIUrl(siteConfig.API_BASE_URL, siteConfig.API_VERSION, path);
    },

    makeAPICall: function(opts, cb) {
      opts.apiCall = true;
      $http(opts)
        .then(function(data) {
          cb(null, data.data);
        })
        .catch(function(data) {
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
     * @param stateAbbrev
     * @param district
     * @param cb
     */
    findLegislatorsByDistrict: function(stateAbbrev, district, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('/legislators/findByDistrict'),
        method: 'GET',
        params: {state: stateAbbrev, district: district},
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
    subscribeToEFFList: function(subRequest, cb) {
      var opts = {
        url: this.makeRelativeAPIURL('/subscription'),
        method: 'POST',
        data: subRequest,
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
    },

    logException: function(exception) {
      var opts = {
        url: this.makeRelativeAPIURL('exception'),
        method: 'POST',
        data: exception
      };

      // Pass in a noop cb, so the exception log is best-effort
      this.makeAPICall(opts, function() {

      });
    }

  };

};

module.exports = ['$http', 'dioConfig', api];
