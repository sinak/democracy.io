/**
 * Tests for the address-form helper methods.
 */

var canonicalAddressJSON = require("./__fixtures__/canonical-address");
var helpers = require("./address-form");
var models = require("../../../models");

describe("www.helpers.address-form", function() {
  var canonicalAddress = new models.CanonicalAddress(canonicalAddressJSON[0]);

  it("should validate an address response", function() {
    var serverErr = helpers.validateAddressResponse(
      new Error("fake server error"),
      null,
      "12345"
    );
    expect(serverErr).toBe(helpers.ADDRESS_ERR_LOOKUP.SERVER);
    var noAddressErr = helpers.validateAddressResponse(null, [], "12345");
    expect(noAddressErr).toBe(helpers.ADDRESS_ERR_LOOKUP.UNRECOGNIZED);
    var mismatchedZipErr = helpers.validateAddressResponse(
      null,
      [canonicalAddress],
      "12345"
    );
    expect(mismatchedZipErr).toBe(helpers.ADDRESS_ERR_LOOKUP.MISMATCHED_ZIP);

    var validResponse = helpers.validateAddressResponse(
      null,
      [canonicalAddress],
      "11111"
    );
    expect(validResponse).toBeInstanceOf(models.CanonicalAddress);
  });

  it("should get default address data", function() {
    var defaultRes = helpers.getAddressData(undefined);
    expect(defaultRes).toMatchObject({
      address: "",
      city: "",
      postal: ""
    });
  });

  it("should get address data from a canonical address", function() {
    var canonicalRes = helpers.getAddressData(canonicalAddress);
    expect(canonicalRes).toMatchObject({
      address: "10 N Test St",
      city: "Wichita, KS",
      postal: "11111"
    });
  });
});
