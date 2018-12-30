/**
 * Router for all routes under /
 */

module.exports = function(middleware) {

  var router = require('express').Router();
  if (middleware) {
    router.use(middleware);
  }

  router.route('/')
    .get(require('./home'));

  router.route('/privacy-policy').get((req, res) => {
    res.render("privacy-policy")
  })

  return router;

};
