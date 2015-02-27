/**
 * Top level handler for entry to the app.
 * @param router
 */

var homeController = require('../views/home');


module.exports = function(router) {
  router({path: '/', name: 'home'})
    .get(homeController);
};
