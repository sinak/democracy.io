/**
 *
 */

var apiHelpers = require('./helpers/api');
var effCivicCRM = require('../../services/third-party-apis/eff-civic-crm');
var models = require('../../../models');
var resHelpers = require('./helpers/response');


var post = function (req, res) {
  var request = apiHelpers.getModelData(req.body, models.EmailCopyRequest);
  //TODO(Randy) all the following
  var params = {
    'contact_params': {
      email: request.sender.email,
      'first_name': request.sender.firstName,
      'last_name': request.sender.lastName,
      source: 'democracy.io',
      subscribe: true,
      'opt_in': false
    },
    'address_params': {
      street: '',
      city: request.canonicalAddress.components.cityName,
      state: request.canonicalAddress.components.stateName,
      zip: request.canonicalAddress.components.zipcode,
      country: 'USA' // hardcoded for now
    }
  };

  effCivicCRM.emailUserCopyOfMessage(params, req.app.locals.CONFIG, function(err) {
    if (err) {
      res.status(400).json(resHelpers.makeError(err));
    }

    // TODO(leah): Look at the format of the response on this
    var modelData = {};
    res.json(resHelpers.makeResponse(modelData));
  });
};


module.exports.post = post;
