/**
 *
 */

var Congress = require('../../../services/congress');
var resHelpers = require('../helpers/response');


var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  if (!Object.keys(Congress.Members).includes(bioguideId))
    res.status(400).json(resHelpers.makeError({ message: "No legislators match this bioguide id" }));
  else
    res.json(resHelpers.makeResponse(Congress.Members[bioguideId]));
};


module.exports.get = get;
