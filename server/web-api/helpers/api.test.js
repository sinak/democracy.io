/**
 * Tests for the API helper methods.
 */

var helpers = require("../helpers/api");
var models = require("./../../../models");

describe("server.routes.api.helpers.api", function() {
  var sampleData = [
    {
      bioguideId: "test-one",
      answer: "answer-one",
      uid: "uid-one"
    },
    {
      bioguideId: "test-two",
      answer: "answer-two",
      uid: "uid-two"
    }
  ];

  var testModel = function(model, num) {
    expect(model).toHaveProperty("bioguideId", "test-" + num);
    expect(model).toHaveProperty("answer", "answer-" + num);
    expect(model).toHaveProperty("uid", "uid-" + num);
  };

  test("should make a model response from a data object", () => {
    var modelObj = helpers.getModelData(sampleData[0], models.CaptchaSolution);
    expect(modelObj).toBeInstanceOf(models.CaptchaSolution);
    testModel(modelObj, "one");
  });

  test("should make an array of model responses from an array of data objects", () => {
    var modelObjs = helpers.getModelData(sampleData, models.CaptchaSolution);
    expect(modelObjs).toHaveLength(2);
    testModel(modelObjs[0], "one");
    testModel(modelObjs[1], "two");
  });
});
