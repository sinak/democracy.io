/**
 * Base application for democracy.io
 */

var angular = require('angular');

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

// Require in all the modules that are used, but not referenced directly
require('angular-route');
require('../../.build/partials/partials');
require('../../.build/dioAppSettings');
