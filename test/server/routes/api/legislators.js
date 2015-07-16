/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require('config');
var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');
var nock = require('nock');

var findByLatLng = require('../../../../server/routes/api/legislators/findByLatLng');
var testUtils = require('../../utils');

nestedDescribe('routes.api.legislators', function() {

  it('should find legislators by lat lng', function(done) {
    nock(config.get('SERVER.API.SUNLIGHT_BASE_URL'))
      .get('/legislators/locate?latitude=37.7833&longitude=-122.4167&apikey=test')
      .reply(200, require('./fixtures/third-party-api-responses/sunlight-legislators'));

    var req = testUtils.getHTTPRequest({
      method: 'GET',
      url: '/api/1/legislators/findByLatLng?latitude=37.7833&longitude=-122.4167',
      query: {
        latitude: 37.7833,
        longitude: -122.4167
      }
    });

    var res = testUtils.getHTTPResponse();

    res.on('end', function() {
      var data = JSON.parse(res._getData());
      var expectedData = require('./fixtures/dio-api-responses/legislators');
      expect(data).to.deep.equal(expectedData);
      done();
    });

    findByLatLng.get(req, res);
  });

});
