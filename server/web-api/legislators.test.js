/*
 * Tests for all /api/{version}/legislator endpoints.
 */

const _ = require("lodash");
const supertest = require("supertest");
const app = require("./../app");
const DIOLegislators = require("../dio/Legislators");
const POTCApi = require("../services/POTC");
jest.mock("../services/POTC");

describe("routes.api.legislators", function() {
  test("should find legislators by district", async () => {
    /** @type {DIO.Legislator[]} */
    const DIOLegislatorsFixture = [
      {
        bioguideId: "1",
        chamber: "house",
        district: 1,
        firstName: "first",
        lastName: "first",
        state: "CA",
        title: "Rep"
      },
      {
        bioguideId: "2",
        chamber: "senate",
        district: null,
        firstName: "second",
        lastName: "second",
        state: "CA",
        title: "Sen"
      },
      {
        bioguideId: "3",
        chamber: "senate",
        district: null,
        firstName: "third",
        lastName: "third",
        state: "CA",
        title: "Sen"
      }
    ];
    /** @type {POTC.FormElementsResult} */
    const POTCFixture = {
      // defunct
      [DIOLegislatorsFixture[0].bioguideId]: {
        required_actions: [],
        defunct: true
      },
      // contact_url
      [DIOLegislatorsFixture[1].bioguideId]: {
        required_actions: [],
        defunct: false
      },
      // nothing added
      [DIOLegislatorsFixture[2].bioguideId]: {
        required_actions: []
      }
    };

    // @ts-ignore
    const mockGetFormElements = POTCApi.getFormElementsForRepIdsFromPOTC.mockResolvedValue(
      {
        data: POTCFixture
      }
    );

    DIOLegislators.loadLegislators(DIOLegislatorsFixture);

    const res = await supertest(app)
      .get("/api/1/legislators/findByDistrict")
      .query({
        state: "CA",
        district: "1"
      });

    const fixtureBioguideIds = DIOLegislatorsFixture.map(l => l.bioguideId);
    expect(mockGetFormElements).toHaveBeenCalledWith(fixtureBioguideIds);

    expect(res.body.data).toContainEqual({
      ..._.omit(DIOLegislatorsFixture[0], ["chamber"]),
      defunct: true
    });

    expect(res.body.data).toContainEqual({
      ..._.omit(DIOLegislatorsFixture[1], ["chamber"]),
      defunct: false
    });

    expect(res.body.data).toContainEqual({
      ..._.omit(DIOLegislatorsFixture[2], ["chamber"]),
      defunct: false
    });
  });
});
