/**
 * Handles posting a new message to POTC.
 */

var apiHelpers = require('../../helpers');
var makePOTCMessage =  require('../../helpers/potc').makePOTCMessage;
var models = require('../../../../../models');
var potc = require('../../../../services/third-party-apis/potc');


var post = function (req, res) {
  var message = new models.Message(req.body);
  var potcMessage = makePOTCMessage(message, req.app.locals.CONFIG.CAMPAIGNS.DEFAULT_TAG);

  if (message.bioguideId !== req.params.bioguideId) {
    var err = new Error('legislator bioguideId does not match message bioguideId');
    res.status(400).json(apiHelpers.makeError(err));
    return;
  }

  potc.sendMessage(potcMessage, req.app.locals.CONFIG, function(err, data) {
    if (err) {
      res.status(400).json(apiHelpers.makeError(err));
    }
    data.bioguideId = message.bioguideId;
    res.json(apiHelpers.makeResponse(new models.MessageResponse(data)));
  });
};


module.exports.post = post;
