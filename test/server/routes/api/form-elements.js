/**
 * Tests for all /api/{version}/formElements endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var nestedDescribe = require("nested-describe");
var nock = require("nock");
var axios = require("axios").default;
var startServer = require("../../../../server/app");
var testUtils = require("../../utils");

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var potcFEFixtures = require("../../fixtures").get(
  "routes.third-party-api.potc-form-elements"
);

nestedDescribe("routes.api.form-elements", function() {
  before(function() {
    nock(config.get("SERVER.API.POTC_BASE_URL"))
      .post("/retrieve-form-elements", {
        bio_ids: ["P000197"]
      })
      .query({
        debug_key: config.get("SERVER.CREDENTIALS.POTC.DEBUG_KEY")
      })
      .reply(200, potcFEFixtures);
  });
  testUtils.setupServer();

  it("should get form elements for specific bioguideIds", function(done) {
    axios({
      baseURL: "http://localhost:3000",
      url: "/api/1/formElements/findByLegislatorBioguideIds",
      params: {
        bioguideIds: ["P000197"]
      }
    })
      .then(res => {
        const fixture = dioAPIFixtures.get("legislator-form-elements");
        const passed = expect(res.data.data[0]).to.deep.equal(fixture.data);
        passed ? done() : done(false);
      })
      .catch(err => {
        done(err);
      });
  });
});
