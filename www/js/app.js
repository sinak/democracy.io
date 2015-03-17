/**
 * Base application for democracy.io
 */

var angular = require('angular');

// Require modules that are used, not referenced directly and need to be in place before creating the app module
require('angular-route');
require('../../.build/dioAppSettings');

var democracyApp = angular.module('democracyIoApp', ['ngRoute', 'dioConstants']);
democracyApp.config(require('./routes'));

democracyApp.controller('HomeController', require('./controllers/home'));
democracyApp.controller('RepPickerController', require('./controllers/rep_picker'));
democracyApp.controller('MessageFormController', require('./controllers/message_form'));
democracyApp.controller('ThanksController', require('./controllers/thanks'));
democracyApp.controller('AboutController', require('./controllers/about'));


democracyApp.factory(
  'dioApi',
  ['$http', 'dioConstants', require('./services/api')]
);
democracyApp.factory('dioRepData', require('./services/rep_data'));

// Require modules that are used, not referenced directly and should be invoked after creating the app module
require('../../.build/partials/partials');