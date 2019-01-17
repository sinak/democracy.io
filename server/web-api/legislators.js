const _ = require("lodash");
const expressRouter = require("express").Router();
const Legislator = require("../../models").Legislator;
var DIOLegislators = require("../dio/Legislators");
var potc = require("../services/POTC");
var resHelpers = require("./helpers/response");

/**
 * GET /legislators/findByDistrict
 */
expressRouter.get("/legislators/findByDistrict", async (req, res) => {
  const { state, district } = req.query;

  if (DIOLegislators.validDistrict(state, district) === false) {
    return res.status(400).json(
      resHelpers.makeError({
        message: "Bad value for state/district parameter"
      })
    );
  }

  var legislators = DIOLegislators.findLegislators(state, district.toString());

  var bioguideIds = legislators.map(function(legislator) {
    return legislator.bioguideId;
  });

  if (!bioguideIds && !legislators) {
    return res.status(400).json(
      resHelpers.makeError({
        message: "Missing legislator or bioguideID data."
      })
    );
  }

  // Call the PotC API get defunct and contact_url properties for each legislator
  const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC(
    bioguideIds
  );

  var augmentedLegislators = legislators
    .map(legislator => {
      var legislatorData = formElementsRes.data[legislator.bioguideId];

      return {
        ...legislator,
        defunct: _.isUndefined(legislatorData.defunct)
          ? false
          : legislatorData.defunct,
        contact_url: legislatorData.contact_url
      };
    })
    .map(l => new Legislator(l));

  res.json(resHelpers.makeResponse(augmentedLegislators));
});

/**
 * /legislators/message
 * Handles posting one or more new message via POTC.
 */

var apiHelpers = require("./helpers/api");
var models = require("../../models");
var potcHelpers = require("./helpers/potc");
var crypto = require("crypto");

expressRouter.post("/legislators/message", async (req, res) => {
  var messages = apiHelpers.getModelData(req.body, models.Message);

  var potcMessages = messages.map(message => {
    var tag = req.app.locals.CONFIG.get("CAMPAIGNS.DEFAULT_TAG");
    tag += "-" + crypto.randomBytes(16).toString("hex");
    return potcHelpers.makePOTCMessage(message, tag);
  });

  const sendMessageRequests = potcMessages.map(message =>
    potc.sendMessage(message)
  );

  try {
    const sendMessageResponses = await Promise.all(sendMessageRequests);
    const modelData = sendMessageResponses.map(
      res => new models.MessageResponse(res)
    );

    res.json(resHelpers.makeResponse(modelData));
  } catch (e) {
    res.status(400).json(resHelpers.makeError(e));
  }
});

module.exports = expressRouter;
