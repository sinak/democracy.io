/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');
var create = require('lodash.create');

var Model = require('./model');


function Error(options) {
  Model.call(this, options);
};


Error.prototype = create(Model.prototype, {
  'constructor': Model
});


Error.prototype.setProperties = function(options) {
  this.code = options.code;
  this.message = options.message;
  this.fields = options.fields;
};


module.exports = Error;
