/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var CanonicalAddress = require('./canonical-address');
var Model = require('./model');
var MessageSender = require('./message-sender');


var SubscriptionRequest = function(options) {
  Model.call(this, options);
};

SubscriptionRequest.prototype = create(Model.prototype, {
  'constructor': Model
});


SubscriptionRequest.prototype.setProperties = function(options) {
  this.setModelProperty('sender', options.sender, MessageSender);
  this.setModelProperty('canonicalAddress', options.canonicalAddress, CanonicalAddress);
};


module.exports = SubscriptionRequest;
