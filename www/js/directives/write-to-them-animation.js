/**
 * Typewriter style text animation.
 */

var writeToThemAnimation = function($timeout) {

  var defaultDelay = 1000;
  var defaultSpeed = 50;

  return {
    restrict: 'A',
    scope: {
      animateMsg: '@',    // The text to animate
      speed: '@',         // The speed at which new message chars are rendered
      initialDelay: '@'   // The initial delay before starting message animation
    },
    templateUrl: '/partials/animated_msg.html',
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

      $timeout($scope.displayCharacter, initialDelay);
    }
  };

};

module.exports = writeToThemAnimation;