/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var nestedDescribe = require("nested-describe");
var nock = require("nock");
var axios = require("axios").default;

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var findByDistrict = require("../../../../server/routes/api/legislators/find-by-district");
var testUtils = require("../../utils");
var thirdPartyFixtures = require("../../fixtures").load(
  "routes.third-party-api"
);

nestedDescribe("routes.api.legislators", function() {
  var mockHTTPCalls = function() {
    nock(config.get("SERVER.API.POTC_BASE_URL"))
      .post("/retrieve-form-elements", {
        bio_ids: ["P000197", "F000062", "H001075"]
      })
      .query({
        debug_key: "test"
      })
      .reply(200, thirdPartyFixtures.get("potc-multiple-bioid-form-elements"));
  };

  before(mockHTTPCalls);

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
        const passed = expect(res.data.data).to.deep.equal(
          dioAPIFixtures.get("legislators").data
        );
        passed ? done() : done(passed);
      })
      .catch(err => done(err));
  });
});
