/**
 * Base application for democracy.io
 */

var angular = require('angular');

var democracyApp = angular.module('democracyIoApp', ['ngRoute', 'dioConstants']);
democracyApp.config(require('./routes'));

democracyApp.controller('dioHome', require('./controllers/home'));
democracyApp.controller('dioRepPicker', require('./controllers/rep_picker'));
democracyApp.controller('dioMessageForm', require('./controllers/message_form'));
democracyApp.controller('dioThanks', require('./controllers/thanks'));
democracyApp.controller('dioAbout', require('./controllers/about'));


democracyApp.factory(
  'dioApi',
  ['$http', 'dioConstants', require('./services/api')]
);
democracyApp.factory('dioRepData', require('./services/rep_data'));

// Require in all the modules that are used, but not referenced directly
require('angular-route');
require('../../.build/partials/partials');
require('../../.build/dioAppSettings');