/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var Model = require('./model');


var Campaign = function(options) {
  Model.call(this, options);
};


Campaign.prototype = create(Model.prototype, {
  'constructor': Model
});


Campaign.prototype.setProperties = function(options) {
  this.uuid = options.uuid;
  this.tag = options.tag;
  this.orgURL = options.orgURL;
  this.orgName = options.orgName;
};


module.exports = Campaign;
