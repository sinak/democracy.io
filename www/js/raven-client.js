var angular = require('angular');
var Raven = require('raven-js');
var dioConfig = require('../../.build/dio-app-settings');

var ravenClient;

if (dioConfig.SENTRY_DSN) {
    ravenClient = Raven.config(dioConfig.SENTRY_DSN)
    .addPlugin(require('raven-js/plugins/angular'), angular)
    .install();
}

module.exports = ravenClient;