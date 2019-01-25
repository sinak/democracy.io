/**
 *
 */

var isArray = require('lodash.isarray');
var map = require('lodash.map');


/**
 * Makes model objects from JSON data.
 * @param data
 * @param modelClass
 * @returns {*}
 */
var getModelData = function(data, modelClass) {
  if (isArray(data)) {
    return map(data, function(item) {
      return new modelClass(item);
    });
  } else {
    return new modelClass(data);
  }
};


module.exports.getModelData = getModelData;
