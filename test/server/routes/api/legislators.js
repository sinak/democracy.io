/**
 * Tests for all /api/{version}/legislator endpoints.
 */

var config = require("config");
var expect = require("chai").expect;
var nestedDescribe = require("nested-describe");
var nock = require("nock");
const DIOApi = require("./../../DIOApi");
const Legislators = require("./../../../../server/services/Legislators");
const POTC = require("./../../../../server/services/POTC");
const sinon = require("sinon");

var dioAPIFixtures = require("../../fixtures").load("routes.dio-api");
var testUtils = require("../../utils");
var thirdPartyFixtures = require("../../fixtures").load(
  "routes.third-party-api"
);
const _ = require("lodash");
sinon.mock

nestedDescribe("routes.api.legislators", function() {
  // var mockHTTPCalls = function() {
  //   nock(config.get("SERVER.API.POTC_BASE_URL"))
  //     .post("/retrieve-form-elements", function(body) {
  //       let bio_ids = ["P000197", "F000062", "H001075"];
  //       return _.difference(bio_ids, body.bio_ids).length === 0;
  //     })
  //     .query(true)
  //     .reply(200, thirdPartyFixtures.get("potc-multiple-bioid-form-elements"));
  // };

  // before(mockHTTPCalls);
  before(testUtils.setupServer);
  // after(() => nock.cleanAll());

  const legislatorsFixtureFile = dioAPIFixtures.get("legislators.data");

  Legislators.loadLegislators(legislatorsFixtureFile);

  it("should find legislators by district", async function() {
    let res;
    res = await DIOApi.get("/api/1/legislators/findByDistrict", {
      params: {
        state: "CA",
        district: "12"
      }
    });
    const ids = res.data.data.map(legislator => legislator.bioguideId);
    const fixtureIds = dioAPIFixtures
      .get("legislators")
      .data.map(l => l.bioguideId);

    return expect(_.difference(ids, fixtureIds)).length.to.equal(0);
  });
});
