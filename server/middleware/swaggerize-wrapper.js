/**
 * Wrapper around the swaggerize-express middleware that:
 *   * converts validation errors to a standard format
 *   * fixes some questionable actions by swaggerize-express
 *
 * @param config
 * @returns {Function}
 */

var lodash = require('lodash');
var swaggerizeExpress = require('swaggerize-express');


var errHandler = function(err, req, res, next) {
  var validationErrors = {};
  lodash.forEach(err.details, function(err) {
    validationErrors[err.path] = err.message;
  });

  var errJson = {
    status: 'error',
    code: res.statusCode,
    message: err.message,
    data: validationErrors
  };
  res.json(errJson);

  next(err);
};


var mountHandler = function(onMountListener, parent) {
  // swaggerize-express does a really annoying config action where it overrides the parent
  // app's settings for the following keys to its own values.
  // As our server is a mixed API and view server, that causes issues, so switch the changed keys
  // back to the initial settings.
  var settingsKeys = [
    'x-powered-by',
    'trust proxy',
    'jsonp callback name',
    'json replacer',
    'json spaces',
    'case sensitive routing',
    'strict routing',
    'views',
    'view cache',
    'view engine'
  ];

  var settings = {};
  lodash.forEach(settingsKeys, function(key) {
    settings[key] = parent.get(key);
  });

  onMountListener(parent);

  lodash.forEach(settings, function(val, key) {
    parent.set(key, val)
  });

  parent.use(errHandler);
};


module.exports = function(config) {

  var swaggerizeApp = swaggerizeExpress(config);

  // Jack the on mount listener so that we can stitch in a default err middleware to the mounted app.
  // This allows production of standardized error responses, while using the swaggerize-express
  // middleware.
  var onMountListener = lodash.values(swaggerizeApp.listeners('mount')[1])[0];
  swaggerizeApp.removeAllListeners();
  swaggerizeApp.once('mount', lodash.partial(mountHandler, onMountListener));

  return swaggerizeApp;
};
