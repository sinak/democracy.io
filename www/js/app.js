/**
 * Base application for democracy.io
 */

var angular = require('angular');

var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');

var democracyApp = angular.module(
  'democracyIoApp',
  ['ngRoute', 'angular-locker', 'ngAnimate', 'ngSanitize', 'ui.mask', 'angular-inview','duScroll']
);

var configureApp = function($provide, $locationProvider, $httpProvider, $interpolateProvider, lockerProvider) {
  $locationProvider.html5Mode(true);

  $provide.factory('modelsHttpInterceptor', services.modelsHttpInterceptor);
  $httpProvider.interceptors.push('modelsHttpInterceptor');

  // Switch the header name so that express finds it.
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';

  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

  lockerProvider
    .setDefaultDriver('session')
    .setDefaultNamespace('dio')
    .setSeparator('.')
    .setEventsEnabled(false);
};
democracyApp.config([
  '$provide',
  '$locationProvider',
  '$httpProvider',
  '$interpolateProvider',
  'lockerProvider',
  configureApp
]);

democracyApp.config(require('./routes'));

angular.forEach(controllers, function(ctrl, ctrlName) {
  democracyApp.controller(ctrlName, ctrl);
});

angular.forEach(services, function(service, serviceName) {
  democracyApp.factory(serviceName, service);
});

democracyApp.directive('dioWriteToThemAnimation', directives.writeToThemAnimation);


// Require modules that are used but not referenced directly
require('angular-route');
require('angular-animate');
require('angular-locker/src/angular-locker');
require('angular-sanitize');
require('angular-inview/angular-inview');
require('angular-ui-utils/modules/mask/mask');
require('angular-scroll/angular-scroll');

// Require local modules generated as part of the build process
require('../../.build/dio-app-settings');
require('../../.build/partials/partials');
