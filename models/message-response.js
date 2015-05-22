/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Model = require('./model');


var MessageResponse = function(options) {
  Model.call(this, options);
};


MessageResponse.prototype = create(Model.prototype, {
  'constructor': Model
});


MessageResponse.prototype.setProperties = function(options) {
  this.bioguideId = options.bioguideId;
  this.status = options.status;
  this.url = options.url;
  this.uid = options.uid;
};


module.exports = MessageResponse;
