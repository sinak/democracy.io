/**
 *
 * @param options
 * @constructor
 */

var lodash = require('lodash');


function Error(options) {
  options = lodash.isEmpty(options) ? {} : options;
    
  this.code = options.code;
  this.message = options.message;
  this.fields = options.fields;
};

module.exports = Error;
