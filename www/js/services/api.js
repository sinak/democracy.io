/**
 * API service for the Democracy.io app.
 */

var angular = require('angular');

var api = function ($http) {


  return {

    /**
     *
     * @param lat
     * @param lng
     */
    getRepsByLocation: function(lat, lng) {

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

    }

  };

};

module.exports = api;
