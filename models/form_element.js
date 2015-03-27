/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


var FormElement = function(options) {
  options = isEmpty(options) ? {} : options;

  this.value = options.value;
  this.maxLength = options.maxLength;
  this.optionsHash = isEmpty(options.optionsHash) ? {} : options.optionsHash;
};


module.exports = FormElement;
