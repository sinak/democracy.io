/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Model = require('./model');


var FormElement = function(options) {
  Model.call(this, options);
};


FormElement.prototype = create(Model.prototype, {
  'constructor': Model
});


FormElement.prototype.setProperties = function(options) {
  this.value = options.value;
  this.maxLength = options.maxLength;
  this.optionsHash = isEmpty(options.optionsHash) ? {} : options.optionsHash;
};


module.exports = FormElement;
