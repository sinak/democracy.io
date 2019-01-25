/**
 * Tests for the API helper methods.
 */

var lodash = require("lodash");

var apiHelpers = require("./api");
var models = require("../../../models");

describe("www.helpers.APIHelpers", function() {
  it("should make an API URL", function() {
    expect(apiHelpers.makeRelativeAPIUrl("apiPath", 1, "test")).toBe(
      "/apiPath/1/test"
    );
    expect(apiHelpers.makeRelativeAPIUrl("//apiPath", 1, "/test")).toBe(
      "/apiPath/1/test"
    );
  });

  it("should coerce a JSON response to a model response", function() {
    var sampleLegislators = [
      {
        bioguideId: "P000197",
        title: "Rep",
        firstName: "Nancy",
        lastName: "Pelosi"
      },
      {
        bioguideId: "H001075",
        title: "Sen",
        firstName: "Kamala",
        lastName: "Harris"
      }
    ];

    var modelLegislators = apiHelpers.coerceJSONResponseToModelResponse(
      sampleLegislators,
      models.Legislator
    );

    expect(Array.isArray(modelLegislators)).toBe(true);
    expect(modelLegislators).toHaveLength(2);

    var modelLegislator = apiHelpers.coerceJSONResponseToModelResponse(
      sampleLegislators[0],
      models.Legislator
    );

    expect(modelLegislator).toBeInstanceOf(models.Legislator);

    lodash.forEach(sampleLegislators[0], function(val, key) {
      expect(modelLegislator).toMatchObject({
        [key]: val
      });
    });
  });
});
