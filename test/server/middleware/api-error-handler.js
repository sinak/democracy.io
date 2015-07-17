/**
 * Tests for the main app routes.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var apiErrHandler = require('../../../server/middleware/api-error-handler');
var middlewareFixtures = require('../fixtures').load('middleware');
var testUtils = require('../utils');


nestedDescribe('server.middleware.api-error-handler', function () {

  it('should make an error object', function(done) {
    var req = testUtils.getAPIRequest({method: 'GET', url: '/api/1/location/verify'});
    var res = testUtils.getHTTPResponse().status(404);
    var err = new Error('test error');

    apiErrHandler()(err, req, res, lodash.noop);
    testUtils.expectJSONResponse(res, middlewareFixtures.get('api-error-handler'), done);
    done();
  });

  it('should not handle errors from outside the API', function(done) {
    var req = testUtils.getHTTPRequest({method: 'GET', url: '/'});
    var res = testUtils.getHTTPResponse();
    var err = new Error('test');

    apiErrHandler()(err, req, res, function() {
      expect(res._getData()).to.be.equal('');
      done();
    });
  });

});
