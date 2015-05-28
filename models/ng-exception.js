/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Model = require('./model');


var NgException = function(options) {
  Model.call(this, options);
};


NgException.prototype = create(Model.prototype, {
  'constructor': Model
});


NgException.prototype.setProperties = function(options) {
  this.url = options.url;
  this.message = options.message;
  this.stackTrace = options.stackTrace;
  this.cause = options.cause;
};


module.exports = NgException;
