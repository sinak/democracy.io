/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var LegislatorsSelected = require('./legislators-selected');
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
  this.setModelProperty('sender', options.sender, MessageSender);
  this.setModelProperty('legislatorsSelected', options.legislatorsSelected, LegislatorsSelected);
  this.setModelProperty('message', options.canonicalAddress, Message);
};

module.exports = EmailCopyRequest;
