/**
 *
 * @param options
 * @constructor
 */

var compact = require('lodash').compact;
var create = require('lodash.create');
var isEmpty = require('lodash.isempty');

var Model = require('./model');


var LegislatorsSelected = function(options) {
  Model.call(this, options);
};


LegislatorsSelected.prototype = create(Model.prototype, {
  'constructor': Model
});


LegislatorsSelected.prototype.setProperties = function(options) {
  this.legislators = options.legislators;
};



module.exports = LegislatorsSelected;
