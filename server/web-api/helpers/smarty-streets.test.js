/**
 * Tests for the API helper methods.
 */

var helpers = require("./smarty-streets");
var models = require("./../../../models");
const smartyStreetsFixtures = require("../../services/__fixtures__/smarty-streets");

describe("server.routes.api.helpers.smarty-streets", function() {
  test("should make a canonical address from a smarty-streets raw address", () => {
    var res = helpers.makeCanonicalAddressFromSSResponse(
      smartyStreetsFixtures[0]
    );
    expect(res.address).toBe("100 Test St, San Francisco CA 94110-2907");
    expect(res).toBeInstanceOf(models.CanonicalAddress);
  });
});
