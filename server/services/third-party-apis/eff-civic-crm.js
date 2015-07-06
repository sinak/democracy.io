/**
 * Helpers for working with the EFF Civic CRM APIs.
 */
  
var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


var makeEFFCivicCRMUrl = function(baseURL, pathname) {
  var effURL = url.parse(baseURL);
  effURL.pathname = pathname;

  return url.format(effURL);
};


var subscribeToEFFMailingList = function(params, config, cb) {
  var effURL = makeEFFCivicCRMUrl(
    config.get('API.EFF_CIVIC_CRM_URL'), 'civicrm/eff-action-api', params, config);

  // To use the EFF Civic CRM API, you send it a POST request, that request must contain:
  //   * The action method to call, in our case import_contact
  //   * The site_key to auth the request
  //   * A JSON string containing details of the person to subscribe
  var params = {
    method: 'POST',
    url: effURL,
    formData: {
      method: 'import_contact',
      data: JSON.stringify(params),
      site_key: config.get('CREDENTIALS.EFF_CIVIC_CRM.SITE_KEY')
    }
  };

  makeRequest(params, cb);

};


module.exports.makeEFFCivicCRMUrl = makeEFFCivicCRMUrl;
module.exports.subscribeToEFFMailingList = subscribeToEFFMailingList;
