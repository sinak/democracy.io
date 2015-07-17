/**
 * Helpers for interacting with the Smarty Streets API.
 */

var path = require('path');
var url = require('url');

var makeRequest = require('./third-party-api').makeRequest;


var makeSmartyStreetsUrl = function(baseURL, pathname, params, ssCreds) {
  var ssURL = url.parse(baseURL);
  ssURL.pathname = pathname;

  params['auth-id'] = ssCreds.ID;
  params['auth-token'] = ssCreds.TOKEN;
  ssURL.query = params;

  return url.format(ssURL);
};


var verifyAddress = function(params, config, cb) {
  var ssURL = makeSmartyStreetsUrl(
    config.get('API.SMARTY_STREETS.ADDRESS_URL'),
    'street-address',
    params,
    config.get('CREDENTIALS.SMARTY_STREETS')
  );

  var requestParams = {
    method: 'GET',
    url: ssURL,
    json: true
  };
  makeRequest(requestParams, cb);
};


module.exports.makeSmartyStreetsUrl = makeSmartyStreetsUrl;
module.exports.verifyAddress = verifyAddress;
