/**
 * Router for all routes under /api/1
 *
 * NOTE: Although the API has a version number, for now it's basically meaningless. It's mostly
 *       there as a placeholder so that future versioned support can be dropped in if needed.
 */

module.exports = function(middleware) {

  var router = require('express').Router();
  if (middleware) {
    router.use(middleware);
  }

  router.route('/legislators/findByDistrict')
    .get(require('./legislators/find-by-district').get);

  router.route('/legislators/message')
    .post(require('./legislators/message').post);


  router.route('/legislator/:bioguideId')
    .get(require('./legislator/{bioguideId}').get);

  router.route('/legislator/:bioguideId/formElements')
    .get(require('./legislator/{bioguideId}/form-elements').get);

  router.route('/legislator/:bioguideId/message')
    .post(require('./legislator/{bioguideId}/message').post);


  router.route('/formElements/findByLegislatorBioguideIds')
    .get(require('./form-elements/find-by-legislator-bioguideIds').get);


  router.route('/location/verify')
    .get(require('./location/verify').get);


  router.route('/captchaSolution')
    .post(require('./captcha-solution').post);


  router.route('/exception')
    .post(require('./exception').post);


  router.route('/subscription')
    .post(require('./subscription').post);

  return router;

};
