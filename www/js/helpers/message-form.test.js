/**
 * Tests for the message-form helper methods.
 */

var helpers = require("./message-form");
var models = require("../../../models");

describe("www.helpers.message-form", function() {
  it("should get topic options", function() {
    var legislatorsFormElements = [
      new models.LegislatorFormElements({
        bioguideId: "A",
        formElements: [
          {
            value: "$TOPIC",
            maxLength: 100,
            optionsHash: {
              fake_topic_1: "fake_topic_1",
              fake_topic_2: "fake_topic_2"
            }
          }
        ]
      })
    ];
    var legislators = [
      new models.Legislator({
        bioguideId: "A",
        title: "Rep",
        lastName: "LastName"
      })
    ];

    var topicOptions = helpers.getTopicOptions(
      legislatorsFormElements,
      legislators
    );
    var expectedTopicOptions = {
      A: {
        bioguideId: "A",
        name: "Rep. LastName",
        options: ["fake_topic_1", "fake_topic_2"],
        optionsHash: {
          fake_topic_1: "fake_topic_1",
          fake_topic_2: "fake_topic_2"
        },
        selected: "fake_topic_1"
      }
    };
    expect(topicOptions).toMatchObject(expectedTopicOptions);

    // It shouldn't produce options where no $TOPIC field is present for a rep
    var noTopiclegislatorsFormElements = [
      new models.LegislatorFormElements({
        bioguideId: "A",
        formElements: []
      })
    ];
    var noTopicOptions = helpers.getTopicOptions(
      noTopiclegislatorsFormElements,
      legislators
    );

    expect(noTopicOptions).toEqual({});
  });

  it("should get county options", function() {
    var legislatorsFormElements = [];
    var addressCounty = "";

    var countyData = helpers.getCountyData(
      legislatorsFormElements,
      addressCounty
    );
  });
});
