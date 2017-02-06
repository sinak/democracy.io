/**
 *
 */


var Congress = require('../../../services/congress');
var resHelpers = require('../helpers/response');

var get = function (req, res) {
  var state = req.query.state,
      district = req.query.district;

  if (!Congress.validDistrict(state, district))
    res.status(400).json(resHelpers.makeError({ message: "Bad value for state/district parameter" }));
  else
    res.json(resHelpers.makeResponse(Congress.getLegislators(state, district)));
};


module.exports.get = get;
