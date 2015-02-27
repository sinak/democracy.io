/**
 * Base application for democracy.io
 */

var angular = require('angular');

var democracyApp = angular.module('DemocracyIoApp', []);

democracyApp.controller('dioHome', require('./controllers/home'));

democracyApp.factory('dioApp', require('./services/api'));
