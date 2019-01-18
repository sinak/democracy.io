var logger = require("../logger");

/**
 *
 * @param {string} serviceName
 */
function createResponseInterceptor(serviceName) {
  return function(res) {
    logger.http(
      `[${serviceName}] ${res.request.method} ${res.config.url} ${res.status}`
    );
    return res;
  };
}

module.exports.createResponseInterceptor = createResponseInterceptor;

/**
 *
 * @param {string} serviceName
 */
function createErrorInterceptor(serviceName) {
  return function(error) {
    if (error.response) {
      logger.http(
        `[${serviceName}] ${error.request.method} ${error.config.url} - ${
          error.response.status
        }`
      );
    }

    return Promise.reject(error);
  };
}
module.exports.createErrorInterceptor = createErrorInterceptor;
