/**
 *
 * @param $routeProvider
 */

var configureRoutes = function($routeProvider) {

  $routeProvider
    .when('/', {
      controller: 'HomeController',
      templateUrl: ''
    })
    .when('/location', {
      controller: 'RepPickerController',
      templateUrl: ''
    })
    .when('/representatives', {
      controller: 'MessageFormController',
      templateUrl: ''
    })
    .when('/thanks', {
      controller: '',
      templateUrl: ''
    })
    .when('/about', {
      controller: 'AboutController',
      templateUrl: ''
    })
    .otherwise({
      redirectTo: '/'
    });

};

module.exports = configureRoutes;
