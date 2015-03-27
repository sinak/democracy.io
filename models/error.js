/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


function Error(options) {
  options = isEmpty(options) ? {} : options;
    
  this.code = options.code;
  this.message = options.message;
  this.fields = options.fields;
};

module.exports = Error;
