/**
 * Tests for all /api/{version}/formElements endpoints.
 */
const supertest = require("supertest");
const POTC = require("../services/POTC");
jest.mock("../services/POTC");

const app = require("../app");

const CongressLegislators = require("../dio/Legislators");
const legislatorsFixture = require("./__fixtures__/legislators-fixture");

var potcFEFixtures = require("../services/__fixtures__/potc-form-elements.js");
const legislatorFormElementsFixtures = require("./__fixtures__/legislator-form-elements.js");

describe("routes.api.form-elements", function() {
  test("should get form elements for specific bioguideIds", async () => {
    CongressLegislators.loadLegislators(legislatorsFixture.data);
    // @ts-ignore
    const mockedPOTC = POTC.getFormElementsForRepIdsFromPOTC.mockResolvedValue({
      data: potcFEFixtures
    });

    const res = await supertest(app)
      .get("/api/1/formElements/findByLegislatorBioguideIds")
      .query({
        bioguideIds: ["P000197", "P123123"]
      })
      .expect(200);

    expect(mockedPOTC).toHaveBeenCalledWith(["P000197", "P123123"]);
    expect(res.body.data[0]).toEqual(legislatorFormElementsFixtures.data);
  });
});
