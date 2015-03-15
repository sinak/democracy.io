/**
 *
 * @param $routeProvider
 */

var configureRoutes = function($routeProvider) {

  $routeProvider
    .when('/', {
      controller: 'HomeController',
      templateUrl: '/partials/home.html'
    })
    .when('/location', {
      controller: 'RepPickerController',
      templateUrl: '/partials/rep_picker.html'
    })
    .when('/representatives', {
      controller: 'MessageFormController',
      templateUrl: '/partials/message_form.html'
    })
    .when('/thanks', {
      controller: '',
      templateUrl: '/partials/thanks.html'
    })
    .when('/about', {
      controller: 'AboutController',
      templateUrl: '/partials/about.html'
    })
    .otherwise({
      redirectTo: '/'
    });

};

module.exports = configureRoutes;
