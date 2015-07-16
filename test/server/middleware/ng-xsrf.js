/**
 * Tests for the main app routes.
 */

var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');

var ngXSRF = require('../../../server/middleware/ng-xsrf');
var testUtils = require('../utils');


nestedDescribe('server.middleware.ng-xsrf', function () {

  it('should set the XSRF token cookie', function(done) {
    var req = testUtils.getHTTPRequest({method: 'GET', url: '/'});
    var res = testUtils.getHTTPResponse();
    res.locals = {
      '_csrf': 'test-csrf'
    };

    ngXSRF({xsrfCookieName: 'test-xsrf'})(req, res, function() {
      expect(res.cookies['test-xsrf'].value).to.equal('test-csrf');
      done();
    });
  });

});
