/**
 * Tests for the API helper methods.
 */

var lodash = require("lodash");
var potcHelperFixtures = require("./__fixtures__/potc.js");
var potcHelpers = require("./potc");
var models = require("../../../models");

describe("server.routes.api.helpers.potc", function() {
  test("should make a LegislatorFormElements model from a POTC response", () => {
    var simplifiedPOTCResponse = {
      P000197: {
        required_actions: [
          {
            value: "$ADDRESS_ZIP5",
            maxlength: null,
            options_hash: null
          },
          {
            value: "$TOPIC",
            maxlength: null,
            options_hash: {
              Agriculture: "AGR"
            }
          }
        ]
      }
    };

    var results = lodash.reduce(
      simplifiedPOTCResponse,
      function(results, val, bioguideId) {
        results.push(potcHelpers.makeLegislatorFormElements(val, bioguideId));
        return results;
      },
      []
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);

    var lfeModel = results[0];
    expect(lfeModel).toBeInstanceOf(models.LegislatorFormElements);

    expect(JSON.stringify(lfeModel)).toBe(
      JSON.stringify(potcHelperFixtures.legislatorFormElements.P000197)
    );
  });

  test("should make a POTC message from a Message model", () => {
    var msgFixtures = potcHelperFixtures.messages;

    var robertsMessage = new models.Message(msgFixtures.roberts.message);
    expect(potcHelpers.makePOTCMessage(robertsMessage, "test")).toEqual(
      msgFixtures.roberts.potcMessage
    );

    var vitterMessage = new models.Message(msgFixtures.vitter.message);
    expect(potcHelpers.makePOTCMessage(vitterMessage, "test")).toEqual(
      msgFixtures.vitter.potcMessage
    );
  });
});
