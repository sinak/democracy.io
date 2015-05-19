/**
 *
 */


var apiCallback = function(res, makeResponse) {

  return function(err, data) {
    if (err === null) {
      res.DIO_API.response(makeResponse(data));
    } else {
      res.DIO_API.error(err);
    }
  };

};


module.exports.apiCallback = apiCallback;
