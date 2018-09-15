/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var lodash = require("lodash");
var nestedDescribe = require("nested-describe");
var nock = require("nock");
var axios = require("axios").default;

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var testUtils = require("../../utils");
var thirdPartyFixtures = require("../../fixtures").load(
  "routes.third-party-api"
);

// TODO(leah): Switch here + elsewhere to use the JSON schema to validate API responses.

nestedDescribe("routes.api.legislator", function() {
  var mockHTTPCalls = function() {
    nock(config.get("SERVER.API.POTC_BASE_URL"))
      .post("/retrieve-form-elements", {
        bio_ids: ["P000197"]
      })
      .query({
        debug_key: config.get("SERVER.CREDENTIALS.POTC.DEBUG_KEY")
      })
      .reply(200, thirdPartyFixtures.get("potc-form-elements"));
  };

  before(mockHTTPCalls);
  testUtils.setupServer();

  it("should fetch a legislator object for a specific bioguideId", function(done) {
    axios({
      method: "GET",
      baseURL: "http://localhost:3000",
      url: "/api/1/legislator/P000197"
    })
      .then(res => {
        const passed = expect(res.data).to.deep.equal(
          dioAPIFixtures.get("legislator")
        );
        passed ? done() : done(passed);
      })
      .catch(err => {
        done(err);
      });
  });

  before(mockHTTPCalls);
  it("should get form elements for a specific bioguideId", function(done) {
    axios({
      method: "GET",
      baseURL: "http://localhost:3000",
      url: "/api/1/legislator/P000197/formElements"
    })
      .then(res => {
        const passed = expect(res.data).to.deep.equal(
          dioAPIFixtures.get("legislator-form-elements")
        );
        passed ? done() : done(new Error());
      })
      .catch(err => done(err));
  });

  // TODO(leah): Add tests for the message call
});
