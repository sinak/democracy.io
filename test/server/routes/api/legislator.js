/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var legislatorByBioguideId = require('../../../../server/routes/api/legislator/{bioguideId}');
var formElemsByBioguideId = require('../../../../server/routes/api/legislator/{bioguideId}/formElements');
var sendMessage = require('../../../../server/routes/api/legislator/{bioguideId}/message');
var testUtils = require('../../utils');

nestedDescribe('routes.api.legislator', function() {

  it('should fetch a legislator object for a specific bioguideId', function(done) {
    var mockData = lodash.cloneDeep(require('./fixtures/third-party-api-responses/sunlight-legislators'));
    mockData.results = lodash.slice(mockData.results, 0, 1);
    nock(config.get('SERVER.API.SUNLIGHT_BASE_URL'))
      .get('/legislators?bioguide_id=P000197&apikey=test')
      .reply(200, mockData);

    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/api/1/legislator/P000197',
      params: {
        bioguideId: 'P000197'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(
      res, require('./fixtures/dio-api-responses/legislator'), done);
    legislatorByBioguideId.get(req, res);
  });

  it('should get form elements for a specific bioguideId', function(done) {
    nock(config.get('SERVER.API.POTC_BASE_URL'))
      .post('/retrieve-form-elements?debug_key=test', {
        'bio_ids': ['P000197']
      })
      .reply(200, require('./fixtures/third-party-api-responses/potc-form-elements'));

    var req = testUtils.getHTTPRequest({
      method: 'POST',
      url: '/api/1/legislator/P000197/formElements',
      params: {
        bioguideId: 'P000197'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(
      res, require('./fixtures/dio-api-responses/legislator-form-elements'), done);
    formElemsByBioguideId.get(req, res);
  });

  it('should send a message to a specific legislator', function(done) {
    var message = {};
    nock(config.get('SERVER.API.POTC_BASE_URL'))
      .post('/fill-out-form?debug_key=test', message)
      .reply(200, {});

    var req = testUtils.getHTTPRequest({
      method: 'POST',
      url: '/api/1/legislator/P000197/message',
      params: {
        bioguideId: 'P000197'
      }
    });

    // TODO(leah): Update and resolve this once the Swagger stuff is done.
    done();
    //var res = testUtils.getHTTPResponse();
    //testUtils.expectJSONResponse(res, {}, done);
    //sendMessage.post(req, res);
  });

});
