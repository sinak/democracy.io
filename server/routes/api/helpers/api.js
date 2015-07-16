/**
 *
 */

var isArray = require('lodash.isarray');
var isUndefined = require('lodash.isundefined');
var map = require('lodash.map');

var responseHelpers = require('./response');

// TODO(leah): Ditch this, it makes it harder to reason about the code
var apiCallback = function(res, makeResponse) {

  return function(err, data) {
    if (err === null || isUndefined(err)) {
      var modelData = makeResponse(data);
      res.json(responseHelpers.makeResponse(modelData));
    } else {
      res.status(400).json(responseHelpers.makeError(err));
    }
  };

};


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
module.exports.apiCallback = apiCallback;
