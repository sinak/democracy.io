/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var CanonicalAddress = require('./canonical-address');
var Model = require('./model');
var MessageSender = require('./message-sender');
//TODO?

var EmailCopyRequest = function(options) {
  Model.call(this, options);
};

EmailCopyRequest.prototype = create(Model.prototype, {
  'constructor': Model
});


EmailCopyRequest.prototype.setProperties = function(options) {
  this.setModelProperty('sender', options.sender, MessageSender);
  this.setModelProperty('canonicalAddress', options.canonicalAddress, CanonicalAddress);
};
//TODO probably


module.exports = EmailCopyRequest;
