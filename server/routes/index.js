/**
 * Top level handler for entry to the app.
 * @param router
 */

var lodash = require('lodash');

var routes = [
  [
    {path: '/', name: 'home'}, {get: require('./app/home')}
  ],
  [
    {path: '/loaderio-da87df4ad13efbd70ba62b11dcbf241b/', name: 'loaderio'},
    {get: function(req, res) {res.send('loaderio-da87df4ad13efbd70ba62b11dcbf241b');}}
  ]
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
