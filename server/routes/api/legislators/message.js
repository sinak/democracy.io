/**
 * Handles posting one or more new message via POTC.
 */

var map = require("lodash.map");

var apiHelpers = require("../helpers/api");
var models = require("../../../../models");
var potc = require("../../../services/POTC");
var potcHelpers = require("../helpers/potc");
var resHelpers = require("../helpers/response");

var crypto = require("crypto");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
var post = function(req, res) {
  var messages = apiHelpers.getModelData(req.body, models.Message);
  var potcMessages = map(messages, function(message) {
    var tag = req.app.locals.CONFIG.get("CAMPAIGNS.DEFAULT_TAG");
    tag += "-" + crypto.randomBytes(16).toString("hex");
    return potcHelpers.makePOTCMessage(message, tag);
  });

  const sendMessageRequests = potcMessages.map(message =>
    potc.sendMessage(message)
  );

  Promise.all(sendMessageRequests)
    .then(responses => {
      var modelData = responses.map(res => new models.MessageResponse(res));
      res.json(resHelpers.makeResponse(modelData));
    })
    .catch(err => {
      res.status(400).json(resHelpers.makeError(err));
    });
};

module.exports.post = post;
