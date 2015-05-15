/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Campaign = require('./campaign');
var CanonicalAddress = require('./canonical-address');
var Model = require('./model');
var MessageSender = require('./message-sender');


var Message = function(options) {
  Model.call(this, options);
};

Message.prototype = create(Model.prototype, {
  'constructor': Model
});


Message.prototype.setProperties = function(options) {
  this.bioguideId = options.bioguideId;
  this.topic = options.topic;
  this.subject = options.subject;
  this.message = options.message;

  this.setModelProperty('sender', options.sender, MessageSender);
  this.setModelProperty('canonicalAddress', options.canonicalAddress, CanonicalAddress);
  this.setModelProperty('campaign', options.campaign, Campaign);
};


module.exports = Message;
