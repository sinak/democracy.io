/**
 *
 */

var apiHelpers = require("./helpers/api");
var models = require("../../models");
var potc = require("../services/POTC");
var resHelpers = require("./helpers/response");
const router = require("express").Router();

router.post("catcha-solution", async (req, res) => {
  var solution = apiHelpers.getModelData(req.body, models.CaptchaSolution);

  try {
    const solveCaptchaRes = await potc.solveCaptcha(solution);
    res.json(resHelpers.makeResponse(solveCaptchaRes.data));
  } catch (err) {
    res.status(400).json(resHelpers.makeError(err));
  }
});

module.exports = router;
