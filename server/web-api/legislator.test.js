/**
 * Tests for all /api/{version}/legislator endpoints.
 */
const supertest = require("supertest");
const app = require("./../app");
const POTC = require("./../services/POTC");
jest.mock("./../services/POTC");

const DIOLegislators = require("./../dio/Legislators");
const DIOLegislatorsFixture = require("../dio/__fixtures__/LegislatorsFixtures");
const potcFormElementsFixture = require("./../services/__fixtures__/potc-form-elements");
const legislatorFormElementsFixture = require("./__fixtures__/legislator-form-elements.js");

// TODO(leah): Switch here + elsewhere to use the JSON schema to validate API responses.

describe("routes.api.legislator", function() {
  beforeAll(() => {
    DIOLegislators.loadLegislators(DIOLegislatorsFixture);
  });

  test("should fetch a legislator object for a specific bioguideId", async () => {
    const res = await supertest(app).get("/api/1/legislator/P000197");

    expect(res.status).toBe(200);

    const f = DIOLegislatorsFixture.find(l => l.bioguideId === "P000197");
    expect(res.body.data).toEqual({
      bioguideId: f.bioguideId,
      district: f.district,
      firstName: f.firstName,
      lastName: f.lastName,
      state: f.state,
      title: f.title
    });
  });

  // beforeAll(mockHTTPCalls);
  test("should get form elements for a specific bioguideId", async () => {
    // @ts-ignore
    const mockedFormElements = POTC.getFormElementsForRepIdsFromPOTC.mockResolvedValueOnce(
      {
        data: potcFormElementsFixture
      }
    );
    const res = await supertest(app).get(
      "/api/1/legislator/P000197/formElements"
    );

    expect(res.status).toBe(200);
    expect(mockedFormElements).toHaveBeenCalled();
    expect(res.body).toEqual(legislatorFormElementsFixture);
  });

  // TODO(leah): Add tests for the message call
});
