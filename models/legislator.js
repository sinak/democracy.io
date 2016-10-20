/**
 *
 * @param options
 * @constructor
 */

var compact = require('lodash').compact;
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
  this.state = options.state;
  this.district = options.district;
};


/**
 * Generates the URL slug for this legislator.
 * @returns {*|string}
 */
Legislator.prototype.slug = function() {
  // TODO(leah): Talk to Sina / Randy about these
  if (this.title === 'Sen') {
    var slugBits = [this.title, this.firstName, this.lastName, this.state];
  } else {
    // Rep, Del or Com
    var slugBits = [this.title, this.firstName, this.lastName, this.state, this.district];
  }

  return compact(slugBits).join('-').toLowerCase();
};


/**
 * Generates the display name for a legislator, this is {title}. {firstName} {lastName}.
 * @returns {string}
 */
Legislator.prototype.displayName = function() {
  return [this.title + '.', this.firstName, this.lastName].join(' ');
};


module.exports = Legislator;
