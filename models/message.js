/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


var Message = function(options) {
  options = isEmpty(options) ? {} : options;
};


module.exports = Message;
