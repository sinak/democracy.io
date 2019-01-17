const expressRouter = require("express").Router();
const resHelpers = require("./helpers/response");
const apiHelpers = require("./helpers/api");
const models = require("../../models");

const DIOLegislators = require("../dio/Legislators");
const Legislator = require("../../models/legislator");

/**
 * GET /legislator/:bioguideId
 */
expressRouter.get("/legislator/:bioguideId", (req, res) => {
  var bioguideId = req.params.bioguideId.toString();

  var legislator = DIOLegislators.getLegislatorByID(bioguideId);

  if (!legislator)
    res.status(400).json(
      resHelpers.makeError({
        message: "No legislator matches this bioguide id"
      })
    );
  else res.json(resHelpers.makeResponse(new Legislator(legislator)));
});

var potc = require("../services/POTC");
var potcHelpers = require("./helpers/potc");

/**
 * GET /legislator/:bioguideId/formElements
 */
expressRouter.get("/legislator/:bioguideId/formElements", async (req, res) => {
  var bioguideId = req.params.bioguideId;

  try {
    const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC([
      bioguideId
    ]);
    var modelData = potcHelpers.makeLegislatorFormElements(
      formElementsRes.data[bioguideId],
      bioguideId
    );
    res.json(resHelpers.makeResponse(modelData));
  } catch (e) {
    console.error(e);
    res.status(400).json(resHelpers.makeError(e));
  }
});

/**
 * POST /legislator/:bioguideId/message
 */
expressRouter.post("/legislator/:bioguideId/message", async (req, res) => {
  var message = apiHelpers.getModelData(req.body, models.Message);
  var potcMessage = potcHelpers.makePOTCMessage(
    message,
    req.app.locals.CONFIG.get("CAMPAIGNS.DEFAULT_TAG")
  );

  if (message.bioguideId !== req.params.bioguideId) {
    var err = new Error(
      "legislator bioguideId does not match message bioguideId"
    );
    res.status(400).json(resHelpers.makeError(err));
    return;
  }

  try {
    const sendMessageRes = await potc.sendMessage(potcMessage);
    var mergedMessage = Object.assign(sendMessageRes.data, {
      bioguideId: message.bioguideId
    });

    res.json(
      resHelpers.makeResponse(new models.MessageResponse(mergedMessage))
    );
  } catch (err) {
    res.status(400).json(resHelpers.makeError(err));
  }
});

module.exports = expressRouter;
