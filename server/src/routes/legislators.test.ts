/*
 * Tests for all /api/{version}/legislator endpoints.
 */
import supertest from "supertest";
import { mocked } from "ts-jest/utils";
import { axiosResponseFixture, legislatorFixture } from "../fixtures";
import Legislators from "../legislators/LegislatorsSearchInstance";
import { LegislatorContact, Chamber } from "../models";
import app from "./../app";
import * as PotcAPI from "./../services/PotcAPI";

jest.mock("../services/PotcAPI");
const mockedPotcAPI = mocked(PotcAPI);

describe("/api/legislators", function () {
  beforeAll(() => {
    Legislators.loadLegislators([
      legislatorFixture({
        bioguideId: "test",
        currentTerm: { state: "CA", chamber: Chamber.Senate },
      }),
    ]);
  });

  test("legislator's form.status is set to defunct if PotC returns defunct: true", async () => {
    mockedPotcAPI.retrieveFormElements.mockResolvedValueOnce({
      ...axiosResponseFixture(),
      data: {
        test: {
          contact_url: "",
          defunct: true,
          required_actions: [
            {
              maxlength: null,
              options_hash: {
                Agriculture: "AGR",
              },
              value: "$TOPIC",
            },
          ],
        },
      },
    });

    const { body } = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 })
      .expect(200);

    const legislatorContact: LegislatorContact = body[0];

    expect(legislatorContact).toMatchObject({
      form: {
        status: "defunct",
        topics: [{ label: "Agriculture", value: "AGR" }],
      },
    });
  });

  test('legislator\'s form.status is set to "ok" if PotC has their data and is not defunct', async () => {
    mockedPotcAPI.retrieveFormElements.mockResolvedValueOnce({
      ...axiosResponseFixture(),
      data: {
        test: {
          contact_url: "",
          defunct: false,
          required_actions: [
            {
              maxlength: null,
              options_hash: {
                Agriculture: "AGR",
              },
              value: "$TOPIC",
            },
          ],
        },
      },
    });

    const { body } = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 })
      .expect(200);

    const legislatorContact: LegislatorContact = body[0];

    expect(legislatorContact).toMatchObject({
      form: {
        status: "ok",
        topics: [{ label: "Agriculture", value: "AGR" }],
      },
    });
  });

  test("it should error if topic is invalid", async () => {
    mockedPotcAPI.retrieveFormElements.mockResolvedValueOnce({
      ...axiosResponseFixture(),
      data: {
        test: {
          contact_url: "",
          defunct: false,
          required_actions: [],
        },
      },
    });

    const { body } = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 })
      .expect(200);

    console.log(body);
  });
  test("it should return a response if the PotC API call fails", async () => {
    const res = await supertest(app)
      .get("/api/legislators/findByDistrict")
      .query({ state: "CA", district: 0 });

    expect(res.status).toBeGreaterThan(299);
  });
});
