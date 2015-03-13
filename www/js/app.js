/**
 * Base application for democracy.io
 */

var angular = require('angular');

var democracyApp = angular.module('democracyIoApp', []);
democracyApp.config(require('./routes'));

democracyApp.controller('dioHome', require('./controllers/home'));
democracyApp.controller('dioRepPicker', require('./controllers/rep_picker'));
democracyApp.controller('dioMessageForm', require('./controllers/message_form'));
democracyApp.controller('dioThanks', require('./controllers/thanks'));
democracyApp.controller('dioAbout', require('./controllers/about'));


democracyApp.factory('dioApp', require('./services/api'));
democracyApp.factory('dioRepData', require('./services/rep_data'));

require('../../.build/partials/partials');