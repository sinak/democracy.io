/**
 * Tests for all /api/{version}/location endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var dioAPIFixtures = require('../../fixtures').load('routes.dio-api');
var testUtils = require('../../utils');
var thirdPartyFixtures = require('../../fixtures').load('routes.third-party-api');
var verifyLocation = require('../../../../server/routes/api/location/verify');


nestedDescribe('routes.api.location', function() {

  var mockHTTPCalls = function() {
    nock(config.get('SERVER.API.SMARTY_STREETS.ADDRESS_URL'))
      .get('/street-address?street=100%20Test%20St%2C%20San%20Francisco%2C%2094110&auth-id=test-id&auth-token=test-token')
      .reply(200, thirdPartyFixtures.get('smarty-streets'));
  };

  before(mockHTTPCalls);

  it('should verify a supplied location', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/location/verify?address=100+Test+St,+San+Francisco,+94110',
      query: {
        address: '100 Test St, San Francisco, 94110'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(res, dioAPIFixtures.get('canonical-address'), done);
    verifyLocation.get(req, res);
  });

});
