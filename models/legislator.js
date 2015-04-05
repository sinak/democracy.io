/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


var Legislator = function(options) {
  options = isEmpty(options) ? {} : options;

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
