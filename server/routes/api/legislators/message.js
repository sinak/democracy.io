/**
 * Handles posting one or more new message via POTC.
 */

var async = require('async');
var map = require('lodash.map');
var partial = require('lodash.partial');

var makePOTCMessage = require('../helpers/potc').makePOTCMessage;
var models = require('../../../../models');
var potc = require('../../../services/third-party-apis/potc');


var post = function (req, res) {
  var potcMessages = map(req.body, function(rawMsg) {
    return makePOTCMessage(new models.Message(rawMsg));
  });

  var cb = function(err, response) {
    if (err === null) {
      res.json({});
    } else {
      // TODO(leah): Throw an error
    }
  };

  async.parallel(map(potcMessages, function(message) {
    return partial(potc.sendMessage, message, req.app.locals.CONFIG)
  }), cb);
};


module.exports.post = post;
