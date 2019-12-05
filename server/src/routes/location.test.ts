/**
 * Tests for all /api/{version}/location endpoints.
 */

import supertest from "supertest";
import { mocked } from "ts-jest/utils";
import app from "./../app";
import * as SmartyStreetsAPI from "./../services/SmartyStreetsAPI";
import { MessageSenderAddress } from "../models";

jest.mock("./../services/SmartyStreetsAPI");
const mockedSmartyStreetsAPI = mocked(SmartyStreetsAPI);

describe("/api/location", function() {
  test("returns the data from Smarty Streets", async () => {
    const mockedVerify = mockedSmartyStreetsAPI.verifyAddress.mockResolvedValueOnce(
      {
        data: [
          {
            input_id: "",
            input_index: 0,
            candidate_index: 0,
            analysis: { dpv_footnotes: "", footnotes: "" },
            delivery_point_barcode: "",
            last_line: "",
            delivery_line_1: "delivery_line_1",
            metadata: {
              congressional_district: "999",
              county_name: "county_name",
              record_type: "F",
              zip_type: "Standard",
              county_fips: "",
              latitude: 0,
              longitude: 0,
              precision: "City",
              dst: true,
              time_zone: "",
              utf_offset: 0
            },
            components: {
              street_name: "street_name",
              city_name: "city_name",
              state_abbreviation: "CA",
              zipcode: "zipcode",
              plus4_code: "plus4_code"
            }
          }
        ],
        status: 200,
        headers: {},
        config: {},
        statusText: ""
      }
    );
    const res = await supertest(app)
      .get("/api/location/verify")
      .query({
        streetAddress: "street address does not matter",
        city: "city does not matter",
        zipCode: "zip code not matter"
      });

    let expected: MessageSenderAddress = {
      city: "city_name",
      county: "county_name",
      district: 999,
      stateFull: "California",
      statePostalAbbrev: "CA",
      streetAddress: "delivery_line_1",
      streetAddress2: null,
      zip4: "plus4_code",
      zip5: "zipcode",
      zipPlus4: "zipcode-plus4_code"
    };

    expect(res.body).toMatchObject(expected);
  });

  test("it should send 400 error if no results", async () => {
    const mockedVerify = mockedSmartyStreetsAPI.verifyAddress.mockResolvedValueOnce(
      {
        data: [],
        status: 200,
        headers: {},
        config: {},
        statusText: ""
      }
    );

    await supertest(app)
      .get("/api/location/verify")
      .query({
        city: "San Francisco",
        zipCode: "94110",
        address: "100 Test St"
      })
      .expect(400);

    expect(mockedVerify).toHaveBeenCalled();
  });
});
