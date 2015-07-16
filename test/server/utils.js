/**
 * Utilities for working with the tests.
 */

var EventEmitter = require('events').EventEmitter;
var config = require('config');
var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');

var appConfig = require('config').get('SERVER');
appConfig.VERSION = require('../../package.json').version;


var getHTTPRequest = function(reqConfig) {
  var req = httpMocks.createRequest(reqConfig);

  req.app = {
    locals: {
      CONFIG: appConfig
    }
  };

  return req;
};


var getHTTPResponse = function() {
  return httpMocks.createResponse({
    eventEmitter: EventEmitter
  });
};


/**
 * Helper to manage the event cycle for expecting a JSON response from the API.
 */
var expectJSONResponse = function(res, expected, cb) {
  res.on('end', function() {
    var data = JSON.parse(res._getData());
    expect(data).to.deep.equal(expected);
    cb();
  });
};


module.exports.getHTTPRequest = getHTTPRequest;
module.exports.getHTTPResponse = getHTTPResponse;
module.exports.expectJSONResponse = expectJSONResponse;
