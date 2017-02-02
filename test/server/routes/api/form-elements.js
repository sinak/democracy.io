/**
 * Tests for all /api/{version}/formElements endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var dioAPIFixtures = require('../../fixtures').load('routes.dio-api');
var findByLegislatorBioguideIds = require('../../../../server/routes/api/form-elements/find-by-legislator-bioguideIds');
var testUtils = require('../../utils');
var potcFEFixtures = require('../../fixtures').get('routes.third-party-api.potc-form-elements');


nestedDescribe('routes.api.form-elements', function() {

  var mockHTTPCalls = function() {
    nock(config.get('SERVER.API.POTC_BASE_URL'))
      .post('/retrieve-form-elements?debug_key='+config.get('SERVER.CREDENTIALS.POTC.DEBUG_KEY'), {
        'bio_ids': ['P000197']
      })
      .reply(200, potcFEFixtures);
  };

  before(mockHTTPCalls);

  it('should get form elements for specific bioguideIds', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'POST',
      url: '/api/1/formElements',
      query: {
        bioguideIds: ['P000197']
      }
    });

    var res = testUtils.getHTTPResponse();
    // Mess with the fixture to make it work for the array response from this endpoint
    var formElements = lodash.clone(dioAPIFixtures.get('legislator-form-elements'));
    formElements.data = [formElements.data];
    testUtils.expectJSONResponse(res, formElements, done);
    findByLegislatorBioguideIds.get(req, res);
  });

});
