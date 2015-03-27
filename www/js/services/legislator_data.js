/**
 *
 */

var angular = require('angular');


var legislatorData = function () {

  return {
    legislators: [],
    selectedLegislators: {},

    setLegislators: function(legislators) {
      this.clearData();
      this.legislators = legislators;
      angular.forEach(this.legislators, function(legislator) {
        this.selectedLegislators[legislator.bioguideId] = true;
      }, this);
    },

    clearData: function() {
      this.legislators = [];
      this.selectedLegislators = {};
    }
  };

};

module.exports = legislatorData;
