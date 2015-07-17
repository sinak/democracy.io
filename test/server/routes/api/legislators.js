/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var dioAPIFixtures = require('../../fixtures').load('routes.dio-api');
var findByLatLng = require('../../../../server/routes/api/legislators/find-by-lat-lng');
var testUtils = require('../../utils');
var thirdPartyFixtures = require('../../fixtures').load('routes.third-party-api');

nestedDescribe('routes.api.legislators', function() {

  var mockHTTPCalls = function() {
    nock(config.get('SERVER.API.SUNLIGHT_BASE_URL'))
      .get('/legislators/locate?latitude=37.7833&longitude=-122.4167&apikey=test')
      .reply(200, thirdPartyFixtures.get('sunlight-legislators'));
  };

  before(mockHTTPCalls);

  it('should find legislators by lat lng', function(done) {
    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/api/1/legislators/findByLatLng?latitude=37.7833&longitude=-122.4167',
      query: {
        latitude: 37.7833,
        longitude: -122.4167
      }
    });

    var res = testUtils.getHTTPResponse();
    testUtils.expectJSONResponse(res, dioAPIFixtures.get('legislators'), done);
    findByLatLng.get(req, res);
  });

});
