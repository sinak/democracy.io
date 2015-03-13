/**
 * Routes for the top level app entry points.
 */

var homeView = require('../views/home');


module.exports = [

  [
    {path: '/', name: 'home'}, {get: homeView}
  ]

];
