/**
 * Helpers for interacting with the Smarty Streets API.
 */

var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


var makeSmartyStreetsUrl = function(baseURL, pathname, params, config) {
  var ssURL = url.parse(baseURL);
  ssURL.pathname = pathname;

  var ssCreds = config.CREDENTIALS.SMARTY_STREETS;
  params['auth-id'] = ssCreds.ID;
  params['auth-token'] = ssCreds.TOKEN;
  ssURL.query = params;

  return url.format(ssURL);
};


var verifyAddress = function(params, config, cb) {
  var ssURL = makeSmartyStreetsUrl(
    config.API.SMARTY_STREETS.ADDRESS_URL, 'street-address', params, config);
  makeRequest({method: 'GET', url: ssURL, json: true}, cb);
};


module.exports.makeSmartyStreetsUrl = makeSmartyStreetsUrl;
module.exports.verifyAddress = verifyAddress;