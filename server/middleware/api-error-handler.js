/**
 *
 * @returns {Function}
 */

var lodash = require('lodash');


module.exports = function() {

  return function (err, req, res, next) {

    // NOTE: this relies on the swagger-express-middleware metadata functions to attach
    //       req.swagger to api routes only.
    if (!lodash.isUndefined(req.swagger)) {
      res.status(400);
      var errJson = {
        status: 'error',
        code: res.statusCode,
        message: err.message,
        data: []
      };
      res.json(errJson);
    } else {
      next();
    }

  };

};
