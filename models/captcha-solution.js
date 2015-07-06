/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');

var Model = require('./model');


var CaptchaSolution = function(options) {
  Model.call(this, options);
};


CaptchaSolution.prototype = create(Model.prototype, {
  'constructor': Model
});


CaptchaSolution.prototype.setProperties = function(options) {
  this.bioguideId = options.bioguideId;
  this.answer = options.answer;
  this.uid = options.uid;
};


module.exports = CaptchaSolution;
