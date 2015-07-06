/**
 *
 */

var apiCallback = require('./helpers/api').apiCallback;
var effCivicCRM = require('../../services/third-party-apis/eff-civic-crm');
var models = require('../../../models');


var post = function (req, res) {
  var request = new models.SubscriptionRequest(req.body);

  var params = {
    'contact_params': {
      email: request.sender.email,
      'first_name': request.sender.first_name,
      'last_name': request.sender.last_name,
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

  var cb = apiCallback(res, function() {
    // TODO(leah): Look at the format of the response on this
    return {
      
    };
  });

  //effCivicCRM.subscribeToEFFMailingList(params, config, function(err, res) {
  //  cb(err, res);
  //});
};


module.exports.post = post;
