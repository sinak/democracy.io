/**
 * Base application for democracy.io
 */

var angular = require('angular');

var democracyApp = angular.module('democracyIoApp', ['ngRoute']);
democracyApp.config(require('./routes'));

democracyApp.controller('HomeController', require('./controllers/home'));
democracyApp.controller('RepPickerController', require('./controllers/rep_picker'));
democracyApp.controller('MessageFormController', require('./controllers/message_form'));
democracyApp.controller('ThanksController', require('./controllers/thanks'));
democracyApp.controller('AboutController', require('./controllers/about'));


democracyApp.factory(
  'dioApi',
  ['$http', 'dioConfig', require('./services/api')]
);
democracyApp.factory('dioRepData', require('./services/rep_data'));

// Require modules that are used and not referenced directly
require('angular-route');
require('../../.build/dioAppSettings');
require('../../.build/partials/partials');