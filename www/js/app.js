/**
 * Base application for democracy.io
 */

var angular = require('angular');

var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');

var democracyApp = angular.module('democracyIoApp', ['ngRoute', 'ngAutocomplete', 'ngCookies']);
democracyApp.config(function($provide, $httpProvider, $interpolateProvider) {
  $provide.factory('modelsHttpInterceptor', services.modelsHttpInterceptor);
  $httpProvider.interceptors.push('modelsHttpInterceptor');

  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});
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
require('ng-autocomplete');
require('angular-cookies');

// Require local modules generated as part of the build process
require('../../.build/dioAppSettings');
require('../../.build/partials/partials');
