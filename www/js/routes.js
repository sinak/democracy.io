/**
 *
 * @param $routeProvider
 */

var configureRoutes = function($routeProvider) {

  $routeProvider
    .when('/', {
      templateUrl: '/partials/home.html',
      title: 'Write to your representatives'
    })
    .when('/location', {
      controller: 'LegislatorPickerController',
      templateUrl: '/partials/legislator-picker.html',
      title: 'Select your recipients'
    })
    .when('/compose', {
      controller: 'MessageFormController',
      templateUrl: '/partials/message-form.html',
      title: 'Write your letter'
    })
    .when('/captcha', {
      controller: 'CaptchaController',
      templateUrl: '/partials/captcha.html',
      title: 'Fill out the captcha'
    })
    .when('/thanks', {
      controller: '',
      templateUrl: '/partials/thanks.html',
      title: 'Message sent!'
    })
    .when('/about', {
      controller: 'AboutController',
      templateUrl: '/partials/about.html',
      title: 'About'
    })
    .otherwise({
      redirectTo: '/'
    });

};

module.exports = configureRoutes;
