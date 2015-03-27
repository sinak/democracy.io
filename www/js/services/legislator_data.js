/**
 *
 */

var angular = require('angular');


var legislatorData = function () {

  return {
    legislators: [],
    selectedLegislators: {},
    legislatorsFormElements: {},

    setLegislators: function(legislators) {
      this.clearData();
      this.legislators = legislators;
      angular.forEach(this.legislators, function(legislator) {
        this.selectedLegislators[legislator.bioguideId] = true;
      }, this);
    },

    setLegislatorsFormElements: function(legislatorsFormElements) {
      for (var i = 0, legislatorFormElem; i < legislatorsFormElements.length; ++i) {
        legislatorFormElem = legislatorsFormElements[i];
        this.legislatorsFormElements[legislatorFormElem.bioguideId] = legislatorFormElem;
      }
    },

    clearData: function() {
      this.legislators = [];
      this.selectedLegislators = {};
      this.legislatorsFormElements = {};
    },

    getSelectedLegislators: function() {
      var selectedLegislators = [];
      for (var i = 0, legislator; i < this.legislators.length; ++i) {
        legislator = this.legislators[i];
        if (this.selectedLegislators[legislator.bioguideId]) {
          selectedLegislators.push(legislator);
        }
      }
      return selectedLegislators;
    }
  };

};

module.exports = legislatorData;
