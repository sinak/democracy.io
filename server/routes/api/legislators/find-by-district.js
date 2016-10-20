/**
 *
 */


var Congress = require('../../../services/congress');
var resHelpers = require('../helpers/response');

var get = function (req, res) {
  var state = req.query.state,
      district = req.query.district;

  if (!Object.keys(Congress.House).includes(state))
    res.status(400).json(resHelpers.makeError({ message: "Bad value for state parameter" }));
  else if (!Object.keys(Congress.House[state]).includes(district))
    res.status(400).json(resHelpers.makeError({ message: "Bad value for district parameter" }));
  else
    res.json(resHelpers.makeResponse([Congress.House[state][district]].concat(Congress.Senate[state])));
};


module.exports.get = get;
