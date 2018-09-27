/**
 * Tests for all /api/{version}/location endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var lodash = require("lodash");
var nestedDescribe = require("nested-describe");
var nock = require("nock");
var axios = require("axios").default;
var startServer = require("./../../../../server/app");

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var testUtils = require("../../utils");
var thirdPartyFixtures = require("../../fixtures").load(
  "routes.third-party-api"
);
var qs = require("querystring");

nestedDescribe("routes.api.location", function() {
  before(function() {
    var ssc = config.get("SERVER.CREDENTIALS.SMARTY_STREETS");
    nock(config.get("SERVER.API.SMARTY_STREETS.ADDRESS_URL"))
      .get("/street-address")
      .query(true)
      .reply(200, thirdPartyFixtures.get("smarty-streets"));
  });
  testUtils.setupServer();

  it("should verify a supplied location", function(done) {
    axios({
      method: "GET",
      baseURL: "http://localhost:3000",
      url: "/api/1/location/verify",
      params: {
        address: "100 Test St, San Francisco, 94110"
      }
    })
      .then(res => {
        const passed = expect(res.data).to.deep.equal(
          dioAPIFixtures.get("canonical-address")
        );
        passed ? done() : done(new Error(passed));
      })
      .catch(err => {
        done(new Error(err));
      });
  });
});
