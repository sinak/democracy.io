/*
 * Tests for all /api/{version}/legislator endpoints.
 */
import * as _ from "lodash";
import supertest from "supertest";
import app from "./../app";
import Legislators from "../legislators/LegislatorsSearchInstance";
import * as PotcAPI from "./../services/PotcAPI";
import { legislatorFixture, axiosResponseFixture } from "../fixtures";
import { mocked } from "ts-jest/utils";

jest.mock("../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

import { LegislatorContact } from "../models";

describe("/api/legislators", function() {
  beforeAll(() => {
    Legislators.loadLegislators([
      legislatorFixture({ bioguideId: "test", state: "CA" })
    ]);
  });

  test("legislator's form.status is set to defunct if PotC returns defunct: true", async () => {
    mockedPotcAPI.retrieveFormElements.mockResolvedValueOnce({
      ...axiosResponseFixture(),
      data: {
        test: {
          contact_url: "",
          defunct: true,
          required_actions: []
        }
      }
    });

    const { body } = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 })
      .expect(200);

    const legislatorContact: LegislatorContact = body.data[0];

    expect(legislatorContact).toMatchObject({
      form: {
        status: "defunct"
      }
    });
  });

  test('legislator\'s form.status is set to "ok" if PotC has their data and is not defunct', async () => {
    mockedPotcAPI.retrieveFormElements.mockResolvedValueOnce({
      ...axiosResponseFixture(),
      data: {
        test: {
          contact_url: "",
          defunct: false,
          required_actions: []
        }
      }
    });

    const { body } = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 })
      .expect(200);

    const legislatorContact: LegislatorContact = body.data[0];

    expect(legislatorContact).toMatchObject({
      form: {
        status: "ok"
      }
    });
  });
});
