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
    expect(res.body.data).toHaveLength(3);

    const leg1 = _.find(res.body.data, {
      bioguideId: DIOLegislatorsFixture[0].bioguideId
    });
    expect(leg1).toBeDefined();
    expect(leg1).toHaveProperty("defunct", true);

    const leg2 = _.find(res.body.data, {
      bioguideId: DIOLegislatorsFixture[1].bioguideId
    });
    expect(leg2).toBeDefined();
    expect(leg2).toHaveProperty("defunct", false);

    const leg3 = _.find(res.body.data, {
      bioguideId: DIOLegislatorsFixture[2].bioguideId
    });
    expect(leg3).toBeDefined();
    expect(leg3).toHaveProperty("defunct", false);
  });

  test("if POTC doesn't have data on a legislator, set comingSoon property to true", async () => {
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
        bioguideId: "missing from potc",
        chamber: "senate",
        district: null,
        firstName: "first",
        lastName: "first",
        state: "CA",
        title: "Sen"
      }
    ];

    DIOLegislators.loadLegislators(DIOLegislatorsFixture);

    /** @type {POTC.FormElementsResult} */
    const potcFormElementsFixture = {
      [DIOLegislatorsFixture[0].bioguideId]: {
        required_actions: []
      }
    };

    // @ts-ignore
    POTCApi.getFormElementsForRepIdsFromPOTC.mockResolvedValueOnce({
      data: potcFormElementsFixture
    });

    const res = await supertest(app)
      .get("/api/1/legislators/findByDistrict")
      .query({
        state: "CA",
        district: "1"
      });

    const missingLegislatorInResponse = res.body.data.find(
      l => l.bioguideId === DIOLegislatorsFixture[1].bioguideId
    );
    expect(missingLegislatorInResponse).toHaveProperty("comingSoon", true);
  });
});
