/**
 * Base application for democracy.io
 */

var angular = require('angular');

var controllers = require('./controllers');
var services = require('./services');

var democracyApp = angular.module('democracyIoApp', ['ngRoute', 'ngAutocomplete']);
democracyApp.config(function($provide, $httpProvider) {
  $provide.factory('modelsHttpInterceptor', services.modelsHttpInterceptor);
  $httpProvider.interceptors.push('modelsHttpInterceptor');
});
democracyApp.config(require('./routes'));

democracyApp.controller('HomeController', controllers.home);
democracyApp.controller('LegislatorPickerController', controllers.LegislatorPickerController);
democracyApp.controller('MessageFormController', controllers.messageForm);
democracyApp.controller('ThanksController', controllers.thanks);
democracyApp.controller('AboutController', controllers.about);


democracyApp.factory('dioApi', ['$http', 'dioConfig', services.api]);
democracyApp.factory('dioLegislatorData', services.legislatorData);
democracyApp.factory('dioPageNav', services.pageNav);

// Require modules that are used but not referenced directly
require('angular-route');
require('ng-autocomplete');

// Require local modules generated as part of the build process
require('../../.build/dioAppSettings');
require('../../.build/partials/partials');
