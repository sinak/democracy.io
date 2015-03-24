/**
 *
 * @param options
 * @constructor
 */

var lodash = require('lodash');


var FormElement = function(options) {
  options = lodash.isEmpty(options) ? {} : options;

  this.value = options.value;
  this.maxLength = options.maxLength;
  this.optionsHash = lodash.isEmpty(options.optionsHash) ? {} : options.optionsHash;
};


module.exports = FormElement;
