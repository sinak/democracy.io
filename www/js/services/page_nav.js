/**
 * Simple service wrapping the history back and forward calls.
 */

var pageNav = function($window, $location) {
  return {
    back: function() {
      $location.path('/');
    },
    forward: function() {
      $window.history.forward();
    }
  }
};

module.exports = pageNav;
