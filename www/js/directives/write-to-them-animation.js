/**
 * Typewriter style text animation.
 */

var writeToThemAnimation = function($timeout) {

  var defaultDelay = 1000;
  var defaultSpeed = 50;

  var spec = {
    restrict: 'A',
    scope: {
      animateMsg: '@',    // The text to animate
      speed: '@',         // The speed at which new message chars are rendered
      initialDelay: '@',  // The initial delay before starting message animation
      showFull: '&'       // Whether or not to show the full message immediately
    },
    templateUrl: '/partials/animated-msg.html',
    controller: function($scope, $element, $attrs) {
      $scope.displayedMsg = '';
      $scope.hasFinishedTyping = false;

      var initialDelay = parseInt($attrs.initialDelay) || defaultDelay;
      var animationSpeed = parseInt($attrs.speed) || defaultSpeed;

      $scope.displayCharacter = function() {
        var newChar = $scope.animateMsg[$scope.displayedMsg.length];
        $scope.displayedMsg += newChar;
        if ($scope.animateMsg !== $scope.displayedMsg) {
          $timeout($scope.displayCharacter, animationSpeed);
        } else {
          $timeout(function() {
            $scope.hasFinishedTyping = true;
          }, animationSpeed);
        }
      };

      if ($scope.showFull()) {
        $scope.hasFinishedTyping = true;
        $scope.displayedMsg = $scope.animateMsg;
      } else {
        $timeout($scope.displayCharacter, initialDelay);
      }

    }
  };

  spec.controller.$inject = ['$scope', '$element', '$attrs'];
  return spec;
};

module.exports = ['$timeout', writeToThemAnimation];