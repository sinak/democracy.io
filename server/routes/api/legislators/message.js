/**
 * Handles posting one or more new message via POTC.
 */

var map = require("lodash.map");
var partial = require("lodash.partial");

var apiHelpers = require("../helpers/api");
var models = require("../../../../models");
var potc = require("../../../services/third-party-apis/potc");
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

  // async.parallel(
  //   map(potcMessages, function(message) {
  //     return function(cb) {
  //       potc.sendMessage(message, req.app.locals.CONFIG, function(err, res) {
  //         res.bioguideId = message["bio_id"];
  //         cb(err, res);
  //       });
  //     };
  //   }),
  //   onComplete
  // );
};

module.exports.post = post;
