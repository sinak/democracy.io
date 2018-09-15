/**
 * Handles posting a new message to POTC.
 */

var apiHelpers = require('../../helpers/api');
var models = require('../../../../../models');
var potc = require('../../../../services/third-party-apis/potc');
var potcHelpers =  require('../../helpers/potc');
var resHelpers = require('../../helpers/response');


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
var post = function (req, res) {
  var message = apiHelpers.getModelData(req.body, models.Message);
  var potcMessage = potcHelpers.makePOTCMessage(
    message, req.app.locals.CONFIG.get('CAMPAIGNS.DEFAULT_TAG'));

  if (message.bioguideId !== req.params.bioguideId) {
    var err = new Error('legislator bioguideId does not match message bioguideId');
    res.status(400).json(resHelpers.makeError(err));
    return;
  }

  potc
    .sendMessage(potcMessage)
    .then(sendMessageRes => {
      var message = Object.assign(sendMessageRes.data, { bioguideId: message.bioguideId })

      res.json(resHelpers.makeResponse(new models.MessageResponse(message)));
    })
    .catch(err => {
      res.status(400).json(resHelpers.makeError(err));
    })
};


module.exports.post = post;
