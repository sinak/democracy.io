/**
 *
 *
 * @param config
 * @returns {Function}
 */

var isArray = require('lodash.isarray');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var map = require('lodash.map');
var partial = require('lodash.partial');


var requestData = function(data, modelClass) {
  if (isArray(data)) {
    return map(data, function(item) {
      return new modelClass(item);
    });
  } else {
    return new modelClass(data);
  }
};


var response = function(res, data) {
  res.json({
    status: 'success',
    data: data
  });
};


var error = function(res, err, opt_statusCode) {
  var statusCode = isUndefined(opt_statusCode) ? 400 : opt_statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    code: opt_statusCode || 400,
    data: null
  });
};


module.exports = function(config) {
  config = isEmpty(config) ? {} : config;
  var namespace = isUndefined(config.namespace) ? 'api' : config.namespace;

  return function(req, res, next) {
    req[namespace] = {
      requestData: requestData
    };
    res[namespace] = {
      response: partial(response, res),
      error: partial(error, res)
    };
    next();
  };

};
