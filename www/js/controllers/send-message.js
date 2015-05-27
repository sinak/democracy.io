/**
 * Wrapper controller for the entire send message process.
 *
 * The send message flow is as follows:
 *   * home
 *   * location
 *   * compose
 *   * thanks
 */

var getPageState = require('../helpers/page-location').getPageState;


var SendMessageController = function($scope, $location) {

  /**
   * The last page the user was on within the send message flow.
   * @type {string}
   */
  $scope.pageFrom = '';

  /**
   * The page the user is currently on within the send message flow.
   * @type {string}
   */
  $scope.pageName = '';

  $scope.$on('$routeChangeSuccess', function(event, newLoc, oldLoc) {
    var pageState = getPageState($location.path(), $scope.pageName, oldLoc);
    $scope.pageFrom = pageState.pageFrom;
    $scope.pageName = pageState.pageName;
	});

};

SendMessageController.$inject = [
  '$scope', '$location'
];


module.exports = SendMessageController;