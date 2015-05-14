/**
 * Handles posting a new message to POTC.
 */

var models = require('../../../../models');


var post = function (req, res) {
  var msg = new models.Message(req.body);
  res.json({});
};


module.exports.post = post;
