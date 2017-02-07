/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var dioAPIFixtures = require('../../fixtures').load('routes.dio-api');
var legislatorByBioguideId = require('../../../../server/routes/api/legislator/{bioguideId}');
var formElemsByBioguideId = require('../../../../server/routes/api/legislator/{bioguideId}/form-elements');
var testUtils = require('../../utils');
var thirdPartyFixtures = require('../../fixtures').load('routes.third-party-api');

// TODO(leah): Switch here + elsewhere to use the JSON schema to validate API responses.


nestedDescribe('routes.api.legislator', function() {

  var mockHTTPCalls = function() {
    nock(config.get('SERVER.API.POTC_BASE_URL'))
      .post('/retrieve-form-elements?debug_key='+config.get('SERVER.CREDENTIALS.POTC.DEBUG_KEY'), {
        'bio_ids': ['P000197']
      })
      .reply(200, thirdPartyFixtures.get('potc-form-elements'));
  };

  before(mockHTTPCalls);

  it('should fetch a legislator object for a specific bioguideId', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/api/1/legislator/P000197',
      params: {
        bioguideId: 'P000197'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(res, dioAPIFixtures.get('legislator'), done);
    legislatorByBioguideId.get(req, res);
  });

  it('should get form elements for a specific bioguideId', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'POST',
      url: '/api/1/legislator/P000197/formElements',
      params: {
        bioguideId: 'P000197'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(res, dioAPIFixtures.get('legislator-form-elements'), done);
    formElemsByBioguideId.get(req, res);
  });

  // TODO(leah): Add tests for the message call

});
