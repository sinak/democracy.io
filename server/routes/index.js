/**
 * Top level handler for entry to the app.
 * @param router
 */

var lodash = require('lodash');

var apiRoutes = require('./api');
var appRoutes = require('./app');

var allRoutes = lodash.flatten([
  apiRoutes,
  appRoutes
]);


module.exports = function(router) {

  var route;
  lodash.forEach(allRoutes, function(routeConfig) {
    route = routeConfig[0];

    lodash.forEach(routeConfig[1], function(val, key) {
      router(route)[key](val);
    });
  });

};
