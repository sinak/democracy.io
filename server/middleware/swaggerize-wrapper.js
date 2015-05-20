/**
 * Wrapper around the swaggerize-express middleware that converts validation errors to a standard format.
 *
 * @param config
 * @returns {Function}
 */

var lodash = require('lodash');
var swaggerizeExpress = require('swaggerize-express');


var errHandler = function(err, req, res, next) {
  // TODO(leah): Figure out the correct JSON body
  res.json({
    status: 'error',
    data: []
  });
  console.log(err);
  next(err);
};


module.exports = function(config) {

  var swaggerizeApp = swaggerizeExpress(config);

  // Jack the on mount listener so that we can stitch in a default err middleware to the mounted app.
  // This allows production of standardized error responses, while using the swaggerize-express
  // middleware.
  var onMountListener = lodash.values(swaggerizeApp.listeners('mount')[1])[0];
  swaggerizeApp.removeAllListeners();
  swaggerizeApp.once('mount', function(parent) {
    onMountListener(parent);
    parent.use(errHandler);
  });

  return swaggerizeApp;
};
