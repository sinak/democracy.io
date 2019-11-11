// @ts-check
var potc = require("../services/POTC");
var resHelpers = require("./helpers/response");

const express = require("express");
const router = express.Router();

/**
 * Requests form elements for multiple legislators from POTC
 */
router.get("/formElements/findByLegislatorBioguideIds", async (req, res) => {
  var bioguideIds = req.query.bioguideIds;
  if (!bioguideIds) return res.sendStatus(400);

  try {
    var formElementsRes = await potc.getFormElements(bioguideIds);
  } catch (e) {
    console.error(e);
    return res.status(400).json(resHelpers.makeError(e));
  }

  const resJSON = Object.keys(formElementsRes.data).map(bioguideId => {
    const legislatorFormElements = formElementsRes.data[bioguideId];

    return {
      bioguideId: bioguideId,
      formElements: legislatorFormElements.required_actions.map(action => {
        // rename properties to camel case
        return {
          value: action.value,
          maxLength: action.maxlength,
          optionsHash: action.options_hash
        };
      })
    };
  });

  res.json({
    status: "success",
    data: resJSON
  });
});

module.exports = router;
