/**
 *
 */

var potc = require("../services/POTC");
var resHelpers = require("./helpers/response");
const router = require("express").Router();

router.post("captcha-solution", async (req, res) => {
  try {
    const solveCaptchaRes = await potc.solveCaptcha(req.body);
    res.json({
      status: "success",
      data: solveCaptchaRes.data
    });
  } catch (err) {
    res.status(400).json(resHelpers.makeError(err));
  }
});

module.exports = router;