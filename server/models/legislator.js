/**
 *
 * @param options
 * @constructor
 */

var lodash = require('lodash');


var Legislator = function(options) {
  options = lodash.isEmpty(options) ? {} : options;

  this.bioguideId = options.bioguideId;
  this.title = options.title;
  this.firstName = options.firstName;
  this.lastName = options.lastName;
  this.nickname = options.nickname;
  this.middleName = options.middleName;
  this.nameSuffix = options.nameSuffix;
  this.aliases = lodash.isEmpty(options.aliases) ? [] : options.aliases;
};

module.exports = Legislator;
