/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var Message = require('./message');
var Model = require('./model');
var MessageSender = require('./message-sender');


var EmailCopyRequest = function(options) {
  Model.call(this, options);
};

EmailCopyRequest.prototype = create(Model.prototype, {
  'constructor': Model
});

EmailCopyRequest.prototype.setProperties = function(options) {
  this.sender = options.sender;
  this.messages = options.messages;
};

module.exports = EmailCopyRequest;
