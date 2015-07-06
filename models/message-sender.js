/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var Model = require('./model');


var MessageSender = function(options) {
  Model.call(this, options);
};

MessageSender.prototype = create(Model.prototype, {
  'constructor': Model
});


MessageSender.prototype.setProperties = function(options) {
  this.namePrefix = options.namePrefix;
  this.firstName = options.firstName;
  this.lastName = options.lastName;
  this.email = options.email;
  this.phone = options.phone;
  this.parenPhone = options.parenPhone;
  this.county = options.county;
};


MessageSender.prototype.fullName = function() {
  return this.firstName + ' ' + this.lastName;
};


module.exports = MessageSender;
