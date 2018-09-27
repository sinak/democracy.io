var logger = require("./../../logger");

module.exports.createResponseInterceptor = function(serviceName) {
  return function(res) {
    logger.http(
      `[${serviceName}] ${res.request.method} ${res.config.url} ${res.status}`
    );
    return res;
  };
};

module.exports.createErrorInterceptor = function(serviceName) {
  return function(error) {
    logger.http(
      `[${serviceName}] ${error.request.method} ${error.config.url} - ${
        error.response.status
      }`
    );

    return Promise.reject(error);
  };
};
