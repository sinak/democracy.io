/**
 *
 */

var isUndefined = require('lodash.isundefined');


var apiCallback = function(res, makeResponse) {

  return function(err, data) {
    if (err === null || isUndefined(err)) {
      res.DIO_API.response(makeResponse(data));
    } else {
      res.DIO_API.error(err);
    }
  };

};


module.exports.apiCallback = apiCallback;
