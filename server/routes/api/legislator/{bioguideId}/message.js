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

  if (message.bioguideId !== req.params.bioguideId) {
    res.DIO_API.error(new Error('legislator bioguideId does not match message bioguideId'));
  } else {
    var makeResponse = function(res) {
      res.bioguideId = message.bioguideId;
      return new models.MessageResponse(res);
    };
    var cb = apiCallback(res, makeResponse);

    potc.sendMessage(potcMessage, req.app.locals.CONFIG, cb);
  }

};


module.exports.post = post;
