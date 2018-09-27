/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var nestedDescribe = require("nested-describe");
var nock = require("nock");
var axios = require("axios").default;

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var testUtils = require("../../utils");
var thirdPartyFixtures = require("../../fixtures").load(
  "routes.third-party-api"
);
const _ = require("lodash");

nestedDescribe("routes.api.legislators", function() {
  var mockHTTPCalls = function() {
    nock(config.get("SERVER.API.POTC_BASE_URL"))
      .post("/retrieve-form-elements", function(body) {
        let bio_ids = ["P000197", "F000062", "H001075"];
        return _.difference(bio_ids, body.bio_ids).length === 0;
      })
      .query(true)
      .reply(200, thirdPartyFixtures.get("potc-multiple-bioid-form-elements"));
  };

  before(mockHTTPCalls);

  after(() => nock.cleanAll());

  testUtils.setupServer();

  it("should find legislators by district", function(done) {
    axios({
      baseURL: "http://localhost:3000",
      url: "/api/1/legislators/findByDistrict",
      params: {
        state: "CA",
        district: "12"
      }
    })
      .then(res => {
        const ids = res.data.data.map(legislator => legislator.bioguideId);
        const fixtureIds = dioAPIFixtures
          .get("legislators")
          .data.map(l => l.bioguideId);
        const passed = expect(_.difference(ids, fixtureIds)).length.to.be(0);

        passed ? done() : done(passed);
      })
      .catch(err => done(err));
  });
});
