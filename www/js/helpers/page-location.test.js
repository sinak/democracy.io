/**
 * Tests for the page location helpers.
 */

var pageLocation = require("./page-location");

describe("www.helpers.page-location", function() {
  it("should get page state", function() {
    // New visit, starting at home
    var newState = pageLocation.getPageState("/", undefined, undefined);
    expect(newState).toMatchObject({
      pageFrom: "new-visit",
      pageName: "home"
    });

    // Existing visit, starting on rep picker page
    var repPickerPageState = pageLocation.getPageState("/location", "home", {});
    expect(repPickerPageState).toMatchObject({
      pageFrom: "home",
      pageName: "location"
    });

    // Existing visit, going back to the home page
    repPickerPageState = pageLocation.getPageState("/", "location", {});
    expect(repPickerPageState).toMatchObject({
      pageFrom: "location",
      pageName: "home"
    });
  });
});
