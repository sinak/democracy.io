/**
 * Handles posting one or more new message via POTC.
 */

var async = require('async');
var map = require('lodash.map');
var partial = require('lodash.partial');

var apiCallback = require('../helpers/api').apiCallback;
var makePOTCMessage = require('../helpers/potc').makePOTCMessage;
var models = require('../../../../models');
var potc = require('../../../services/third-party-apis/potc');


var post = function (req, res) {
  var potcMessages = map(req.body, function(rawMsg) {
    return makePOTCMessage(new models.Message(rawMsg), req.app.locals.CONFIG.CAMPAIGNS.DEFAULT_TAG);
  });

  var makeResponse = function(results) {
    return map(results, function(res) {
      return new models.MessageResponse(res);
    });
  };
  var cb = apiCallback(res, makeResponse);

  var makeAPICall = function(message, config, cb) {
    potc.sendMessage(message, config, function(err, res) {
      res.bioguideId = message['bio_id'];
      cb(err, res);
    });
  };

  async.parallel(map(potcMessages, function(message) {
    return partial(makeAPICall, message, req.app.locals.CONFIG)
  }), cb);
};


module.exports.post = post;
