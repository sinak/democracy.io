var Raven = require('raven');
var config = require('./config');
var ravenClient = Raven.config(config.CREDENTIALS.SENTRY_DSN).install();

// Also log Raven errors to console if in dev mode

if (process.env.NODE_ENV === 'development') {
    ravenClient._captureMessage = ravenClient.captureMessage;
    ravenClient._captureException = ravenClient.captureException;
    
    ravenClient.captureMessage = function(message, kwargs, cb){
        console.log(message);
        this._captureMessage(message, kwargs, cb);
    };
    ravenClient.captureException = function(error, kwargs, cb){
        console.log(error);
        this._captureException(error, kwargs, cb);
    };
}

module.exports = ravenClient;
