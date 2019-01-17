var potc = require("../services/POTC");
var potcHelpers = require("./helpers/potc");
var resHelpers = require("./helpers/response");

const express = require("express");
const router = express.Router();

router.get("/formElements/findByLegislatorBioguideIds", async (req, res) => {
  var bioguideIds = req.query.bioguideIds;
  if (!bioguideIds) {
    res.sendStatus(400);
    return;
  }

  try {
    const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC(
      bioguideIds
    );
    var modelData = Object.keys(formElementsRes.data).map(id => {
      return potcHelpers.makeLegislatorFormElements(
        formElementsRes.data[id],
        id
      );
    });

    res.json(resHelpers.makeResponse(modelData));
  } catch (e) {
    console.error(e);
    res.status(400).json(resHelpers.makeError(e));
  }
});

module.exports = router;
