var makeResponse = function(data) {
  return {
    status: 'success',
    data: data
  };
};


var makeError = function(err, opt_statusCode) {
  return {
    status: 'error',
    message: err.message,
    code: opt_statusCode || 400,
    data: null
  };
};


module.exports.makeError = makeError;
module.exports.makeResponse = makeResponse;
