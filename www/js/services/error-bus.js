/**
 *
 */

var stacktraceJs = require('stacktrace-js');


var errorBus = function($injector, $log, $window) {

  var dioAPI;

  return function(exception, cause) {
    try {
      dioAPI = dioAPI || $injector.get('dioAPI');
      var ex = {
        url: $window.location.href,
        message: exception.message,
        stackTrace: stacktraceJs({e: exception}).join('\n'),
        cause: cause || ''
      };
      dioAPI.logException(ex);
    } catch (err) {
      // Ignore this
    }
    $log.error(exception, cause);
  };

};


module.exports = ['$injector', '$log', '$window', errorBus];
