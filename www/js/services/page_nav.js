/**
 * Simple service wrapping the history back and forward calls.
 */

var pageNav = function($window) {
  return {
    back: function() {
      $window.history.back();
    },
    forward: function() {
      $window.history.forward();
    }
  }
};

module.exports = pageNav;
