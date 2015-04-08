/**
 * Helpers for any 3rd party API.
 */

var request = require('request');


/**
 * Wrapper around the request function.
 * @param params
 * @param cb
 */
var makeRequest = function(params, cb) {

  request(params, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      cb(body, null);
    } else {
      cb(null, err);
    }
  });

};


module.exports.makeRequest = makeRequest;
