/**
 * Creates a cookie containing the CSRF token that can be picked up and used by Angular.
 * @param config
 * @returns {Function}
 */

var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');

module.exports = function(config) {
  config = isEmpty(config) ? {} : config;
  var cookieName = isUndefined(config.xsrfCookieName) ? 'XSRF-TOKEN' : config.xsrfCookieName;

  return function(req, res, next) {
    res.cookie(cookieName, res.locals._csrf);
    next();
  };
};
