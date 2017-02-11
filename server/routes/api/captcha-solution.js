/**
 *
 */

var apiHelpers = require('./helpers/api');
var models = require('../../../models');
var potc = require('../../services/third-party-apis/potc');
var resHelpers = require('./helpers/response');


var post = function (req, res) {
  var solution = apiHelpers.getModelData(req.body, models.CaptchaSolution);

  potc.solveCaptcha(solution, req.app.locals.CONFIG, function(err, data) {
    if (err)
      return res.status(400).json(resHelpers.makeError(err));

    // This kicks back a {'status': $status} response. There's no real point making an object.
    res.json(resHelpers.makeResponse(data));
  });
};


module.exports.post = post;
