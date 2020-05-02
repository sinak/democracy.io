import Legislators from "./../legislators/LegislatorsSearchInstance";
import * as congressLegislatorsFile from "../datasets/congress-legislators";

import { mocked } from "ts-jest/utils";
import { axiosResponseFixture } from "./../fixtures";
import supertest from "supertest";
import app from "./../app";

import * as PotcAPI from "./../services/PotcAPI";
import { LegislatorContact, Legislator, Chamber } from "../models";

jest.mock("../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

let legislators: Legislator[];
const stateDistricts = new Set<[string, number]>();

beforeAll(async () => {
  legislators = await congressLegislatorsFile.fetch();
  // load live data
  Legislators.loadLegislators(legislators);

  legislators.forEach((legislator) => {
    if (legislator.currentTerm.chamber === Chamber.House) {
      stateDistricts.add([
        legislator.currentTerm.state,
        legislator.currentTerm.district,
      ]);
    }
  });
}, 60000);

afterAll(() => {
  Legislators.clearLegislators();
});

test("can find legislators for all possible state districts", async () => {
  for (let [state, district] of stateDistricts) {
    // mock every requested bioguide
    mockedPotcAPI.retrieveFormElements.mockImplementationOnce(
      async (bioguideIds) => {
        let data: PotcAPI.RetrieveFormElementsResponse = {};
        bioguideIds.forEach((bioguide) => {
          data[bioguide] = {
            contact_url: "",
            defunct: false,
            required_actions: [
              {
                value: "$TOPIC",
                maxlength: null,
                options_hash: {},
              },
            ],
          };
        });
        return axiosResponseFixture({ data: data });
      }
    );

    const res = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({
        state,
        district,
      })
      .expect(200);

    const resLegislators: LegislatorContact[] = res.body;

    const expectedLegislators = legislators.filter((legislator) => {
      return (
        legislator.currentTerm.state === state &&
        (legislator.currentTerm.chamber === Chamber.Senate ||
          (legislator.currentTerm.chamber === Chamber.House &&
            legislator.currentTerm.district === district))
      );
    });
    let expectedBioguides = expectedLegislators.map((l) => l.bioguideId);

    for (let bioguide of expectedBioguides) {
      expect(resLegislators.map((l) => l.legislator.bioguideId)).toContain(
        bioguide
      );
    }
  }
}, 10000);
