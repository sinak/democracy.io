/**
 * Tests for all /api/{version}/location endpoints.
 */

const supertest = require("supertest");
const app = require("./../app");

const SmartyStreets = require("./../services/SmartyStreetsAPI");
jest.mock("./../services/SmartyStreetsAPI");

const smartyStreetsFixture = require("../services/__fixtures__/smarty-streets");
describe("routes.api.location", function() {
  test("should verify a supplied location", async () => {
    // @ts-ignore
    const mockedVerify = SmartyStreets.verifyAddress.mockResolvedValueOnce({
      data: smartyStreetsFixture
    });
    const res = await supertest(app)
      .get("/api/1/location/verify")
      .query({
        address: "100 Test St, San Francisco, 94110"
      })
      .expect(200);

    expect(mockedVerify).toHaveBeenCalled();

    const f = smartyStreetsFixture[0];
    expect(res.body.data[0]).toMatchObject({
      components: {
        cityName: f.components.city_name,
        plus4Code: f.components.plus4_code,
        primaryNumber: f.components.primary_number,
        stateAbbreviation: f.components.state_abbreviation,
        streetName: f.components.street_name,
        streetSuffix: f.components.street_suffix,
        zipcode: f.components.zipcode
      },
      county: f.metadata.county_name,
      district: f.metadata.congressional_district
    });
  });
});
