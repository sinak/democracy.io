/**
 *
 */

var apiHelpers = require('./helpers');
var effCivicCRM = require('../../services/third-party-apis/eff-civic-crm');
var models = require('../../../models');


var post = function (req, res) {
  var request = apiHelpers.getModelData(req.body, models.SubscriptionRequest);

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

  var cb = apiHelpers.apiCallback(res, function() {
    // TODO(leah): Look at the format of the response on this
    return {

    };
  });

  effCivicCRM.subscribeToEFFMailingList(params, req.app.locals.CONFIG, function(err, res) {
    cb(err, res);
  });
};


module.exports.post = post;
