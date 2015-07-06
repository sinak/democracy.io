/**
 *
 */

var apiCallback = require('./helpers/api').apiCallback;
var effCivicCRM = require('../../services/third-party-apis/eff-civic-crm');
var models = require('../../../models');


var post = function (req, res) {
  var request = new models.SubscriptionRequest(req.body);

  // TODO(leah): Pull out the relevant params
  var params = {
    'contact_params': {
      email: '',
      'first_name': '',
      'last_name': '',
      source: 'democracy.io',
      subscribe: true,
      'opt_in': false
    },
    'address_params': {
      street: '',
      city: request.components.cityName,
      state: request.components.stateName,
      zip: request.components.zipcode,
      // hardcoded for now
      country: 'USA'
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
