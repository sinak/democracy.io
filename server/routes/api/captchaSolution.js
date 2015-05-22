/**
 *
 */

var apiCallback = require('./helpers/api').apiCallback;
var models = require('../../../models');
var potc = require('../../services/third-party-apis/potc');


var post = function (req, res) {
  var solution = new models.CaptchaSolution(req.body);

  var makeResponse = function(res) {
    // This kicks back a {'status': $status} response. There's no real point making an object.
    return res;
  };
  var cb = apiCallback(res, makeResponse);

  potc.solveCaptcha(solution, req.app.locals.CONFIG, cb);
};


module.exports.post = post;
