/**
 * Handles posting a new message to POTC.
 */

var apiHelpers = require('../../helpers/api');
var models = require('../../../../../models');
var potc = require('../../../../services/third-party-apis/potc');
var potcHelpers =  require('../../helpers/potc');
var resHelpers = require('../../helpers/response');


var post = function (req, res) {
  var message = apiHelpers.getModelData(req.body, models.Message);
  var potcMessage = potcHelpers.makePOTCMessage(
    message, req.app.locals.CONFIG.get('CAMPAIGNS.DEFAULT_TAG'));

  if (message.bioguideId !== req.params.bioguideId) {
    var err = new Error('legislator bioguideId does not match message bioguideId');
    res.status(400).json(apiHelpers.makeError(err));
    return;
  }

  potc.sendMessage(potcMessage, req.app.locals.CONFIG, function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    data.bioguideId = message.bioguideId;
    res.json(resHelpers.makeResponse(new models.MessageResponse(data)));
  });
};


module.exports.post = post;
