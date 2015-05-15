/**
 *
 */

var isEmpty = require('lodash.isEmpty');

var Model = function(options) {
  this.setProperties(isEmpty(options) ? {} : options);
};


/**
 *
 * @param setProperties
 */
Model.prototype.setProperties = function(options) {

};


/**
 *
 * @param options
 */
Model.prototype.setModelProperty = function(key, modelOpts, modelClass) {
  var newModel = modelOpts instanceof modelClass ? modelOpts : new modelClass(modelOpts);
  this[key] = newModel;
};


module.exports = Model;