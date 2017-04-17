/**
 * Handles posting one or more new message via POTC.
 */

var async = require('async');
var map = require('lodash.map');
var partial = require('lodash.partial');

var apiHelpers = require('../helpers/api');
var models = require('../../../../models');
var potc = require('../../../services/third-party-apis/potc');
var potcHelpers = require('../helpers/potc');
var resHelpers = require('../helpers/response');


var post = function (req, res) {
  var messages = apiHelpers.getModelData(req.body, models.Message);
  var potcMessages = map(messages, function(message) {
    return potcHelpers.makePOTCMessage(message, req.app.locals.CONFIG.get('CAMPAIGNS.DEFAULT_TAG'));
  });

  var onComplete = function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    var modelData = map(data, function(res) {
      return new models.MessageResponse(res);
    });
    res.json(resHelpers.makeResponse(modelData));
  };

  async.parallel(map(potcMessages, function(message) {
    return function(cb) {
      potc.sendMessage(message, req.app.locals.CONFIG, function(err, res) {
        res.bioguideId = message['bio_id'];
        cb(err, res);
      });
    };
  }), onComplete);
};


module.exports.post = post;
