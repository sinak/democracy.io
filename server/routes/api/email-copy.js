/**
 *
 */

var apiHelpers = require('./helpers/api');
var effAWSSES = require('../../services/third-party-apis/eff-aws-ses');
var models = require('../../../models');
var resHelpers = require('./helpers/response');


var prepareEmailCopyBody = function (message) {
  // strip out the salutation
  message = message.split("\n");
  message.shift();
  message = message.join("\n");

  // add thank you message from EFF
  var thankyou = "Thank you for using Democracy.io to contact Congress. Your message was:\n\n";
  message = thankyou.concat(message);

  return message;
}

var post = function (req, res) {
  var request = apiHelpers.getModelData(req.body, models.EmailCopyRequest);

  var params = {
    contact_params: {
      email: request.sender.email,
      first_name: request.sender.firstName,
      last_name: request.sender.lastName,
      source: 'democracy.io',
      email_copy: true
    },
    message_params: {
      subject: request.messages[0].subject,
      message: prepareEmailCopyBody(request.messages[0].message)
    }
  };

  effAWSSES.emailUserCopyOfMessage(params, req.app.locals.CONFIG, function(err) {
    if (err) {
      return;
    }

    // TODO(leah): Look at the format of the response on this
    var modelData = {};
    res.json(resHelpers.makeResponse(modelData));
  });

};


module.exports.post = post;
