/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var dioAPIFixtures = require('../../fixtures').load('routes.dio-api');
var findByDistrict = require('../../../../server/routes/api/legislators/find-by-district');
var testUtils = require('../../utils');
var thirdPartyFixtures = require('../../fixtures').load('routes.third-party-api');


nestedDescribe('routes.api.legislators', function() {

  var mockHTTPCalls = function() {
    nock(config.get('SERVER.API.POTC_BASE_URL'))
      .post('/retrieve-form-elements?debug_key=test', {
        'bio_ids': ['P000197','F000062','H001075']
      })
      .reply(200, thirdPartyFixtures.get('potc-multiple-bioid-form-elements'));
  };

  before(mockHTTPCalls);

  it('should find legislators by district', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/api/1/legislators/findByDistrict?state=CA&district=12',
      query: {
        state: 'CA',
        district: '12'
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(res, dioAPIFixtures.get('legislators'), done);
    findByDistrict.get(req, res);
  });

});
