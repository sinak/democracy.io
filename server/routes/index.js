/**
 * Top level handler for entry to the app.
 * @param router
 */

var lodash = require('lodash');

var routes = [
  [{path: '/', name: 'home'}, {get: require('./app/home')}]
];


module.exports = function(router) {

  var route, httpHandlers;
  lodash.forEach(routes, function(routeConfig) {
    route = routeConfig[0];
    httpHandlers = routeConfig[1];

    lodash.forEach(httpHandlers, function(handler, httpVerb) {
      router(route)[httpVerb](handler);
    });
  });

};
