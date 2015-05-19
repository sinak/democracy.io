/**
 * Handles posting a new message to POTC.
 */

var apiCallback = require('../../helpers/api').apiCallback;
var makePOTCMessage =  require('../../helpers/potc').makePOTCMessage;
var models = require('../../../../../models');
var potc = require('../../../../services/third-party-apis/potc');


var post = function (req, res) {
  var message = new models.Message(req.body);
  var potcMessage = makePOTCMessage(message, req.app.locals.CONFIG.CAMPAIGNS.DEFAULT_TAG);

  var makeResponse = function(data) {
    return data;
  };
  var cb = apiCallback(res, makeResponse);

  potc.sendMessage(potcMessage, req.app.locals.CONFIG, cb);
};


module.exports.post = post;
