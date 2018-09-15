/**
 *
 */

var apiHelpers = require("./helpers/api");
var models = require("../../../models");
var potc = require("../../services/third-party-apis/potc");
var resHelpers = require("./helpers/response");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
var post = function(req, res) {
  var solution = apiHelpers.getModelData(req.body, models.CaptchaSolution);

  potc
    .solveCaptcha(solution)
    .then(solveCaptchaRes => {
      if (solveCaptchaRes.status >= 200 && solveCaptchaRes.status < 300) {
        res.json(resHelpers.makeResponse(solveCaptchaRes.data));
      }
    })
    .catch(err => {
      res.status(400).json(resHelpers.makeError(err));
    });
};

module.exports.post = post;
