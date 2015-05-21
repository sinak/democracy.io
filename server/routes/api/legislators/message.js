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

  var makeResponse = function(data) {
    return data;
  };
  var cb = apiCallback(res, makeResponse);

  async.parallel(map(potcMessages, function(message) {
    return partial(potc.sendMessage, message, req.app.locals.CONFIG)
  }), cb);
};


module.exports.post = post;
