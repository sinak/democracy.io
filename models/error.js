/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var Model = require('./model');


var Error = function(options) {
  Model.call(this, options);
};


Error.prototype = create(Model.prototype, {
  'constructor': Model
});


Error.prototype.setProperties = function(options) {

  /**
   * The HTTP code of the response.
   * @type {number}
   */
  this.code = options.code;

  /**
   * An error status, typically just 'error'
   * @type {string}
   */
  this.status = options.status;

  /**
   * A user or log friendly message describing the error.
   * @type {string}
   */
  this.message = options.message;

  /**
   * Object describing the field by field errors.
   * @type {{}}
   */
  this.data = options.data;
};

module.exports = Error;
