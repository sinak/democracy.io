/**
 * Top level controller for the democracy.io app.
 */

var isEmpty = require('lodash.isEmpty');


var HomeController = function($scope, $location, dioApi, dioLegislatorData) {

	$scope.submit = function(location) {
    var lat = location.lat();
    var lng = location.lng();

    dioLegislatorData.clearData();
    $location
        .path('/location')
        .search({lat: lat, lng: lng});
	};

};

module.exports = HomeController;
