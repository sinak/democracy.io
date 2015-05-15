/**
 * Handles posting a new message to POTC.
 */

var makePOTCMessage =  require('../../helpers/potc').makePOTCMessage;
var models = require('../../../../../models');
var potc = require('../../../../services/third-party-apis/potc');


var post = function (req, res) {
  var message = new models.Message(req.body);
  var potcMessage = makePOTCMessage(message);

  var cb = function(err, response) {
    if (err === null) {
      res.json({});
    } else {
      // TODO(leah): Throw an error
    }
  };

   potc.sendMessage(potcMessage, req.app.locals.CONFIG, cb);
};


module.exports.post = post;
