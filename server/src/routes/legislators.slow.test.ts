import Legislators from "./../legislators/LegislatorsSearchInstance";
import * as congressLegislatorsFile from "./../datasets/congress-legislators-file";

import { mocked } from "ts-jest/utils";
import { axiosResponseFixture } from "./../fixtures";
import supertest from "supertest";
import app from "./../app";

import * as PotcAPI from "./../services/PotcAPI";
import { LegislatorContact, Legislator } from "../models";

jest.mock("../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

let legislators: Legislator[];
const stateDistricts = new Set<[string, number]>();

beforeAll(async () => {
  legislators = await congressLegislatorsFile.fetchFile();
  // load live data
  Legislators.loadLegislators(legislators);

  legislators.forEach(legislator => {
    if (legislator.currentTerm.chamber === "house") {
      stateDistricts.add([legislator.state, legislator.currentTerm.district]);
    }
  });

  return;
}, 60000);

afterAll(() => {
  Legislators.clearLegislators();
})

test("can find legislators for all possible state districts", async () => {
  for (let [state, district] of stateDistricts) {
    // mock every requested bioguide
    mockedPotcAPI.retrieveFormElements.mockImplementationOnce(
      async bioguideIds => {
        let data: PotcAPI.RetrieveFormElementsResponse = {};
        bioguideIds.forEach(bioguide => {
          data[bioguide] = {
            contact_url: "",
            defunct: false,
            required_actions: []
          };
        });
        return axiosResponseFixture({ data: data });
      }
    );

    const res = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({
        state,
        district
      })
      .expect(200);

    const resLegislators: LegislatorContact[] = res.body.data;

    const expectedLegislators = legislators.filter(legislator => {
      return (
        legislator.state === state &&
        (legislator.currentTerm.chamber === "senate" ||
          (legislator.currentTerm.chamber === "house" &&
            legislator.currentTerm.district === district))
      );
    });
    let expectedBioguides = expectedLegislators.map(l => l.bioguideId);

    for (let bioguide of expectedBioguides) {
      expect(resLegislators.map(l => l.bioguideId)).toContain(bioguide);
    }
  }
}, 10000);
