/**
 *
 * @param options
 * @constructor
 */

var lodash = require('lodash');


var LegislatorFormElements = function(options) {
  options = lodash.isEmpty(options) ? {} : options;
    
  this.bioguideId = options.bioguideId;
  this.formElements = lodash.isEmpty(options.formElements) ? [] : options.formElements;
};

module.exports = LegislatorFormElements;
