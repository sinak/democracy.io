/**
 *
 */

var Congress = require('../../../services/congress');
var resHelpers = require('../helpers/response');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  if (!Congress.Members[bioguideId])
    res.status(400).json(resHelpers.makeError({ message: "No legislator matches this bioguide id" }));
  else
    res.json(resHelpers.makeResponse(Congress.Members[bioguideId]));
};


module.exports.get = get;
