/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Model = require('./model');


var Legislator = function(options) {
  Model.call(this, options);
};


Legislator.prototype = create(Model.prototype, {
  'constructor': Model
});


Legislator.prototype.setProperties = function(options) {
  this.bioguideId = options.bioguideId;
  this.title = options.title;
  this.firstName = options.firstName;
  this.lastName = options.lastName;
  this.nickname = options.nickname;
  this.middleName = options.middleName;
  this.nameSuffix = options.nameSuffix;
  this.aliases = isEmpty(options.aliases) ? [] : options.aliases;
};


Legislator.prototype.displayName = function() {
  return ' '.join([this.title + '.', this.firstName, this.lastName]);
};


module.exports = Legislator;
