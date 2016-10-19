/**
 *
 */

var jsonfile = require("jsonfile");

var Legislator = require('../../../../models').Legislator;
var resHelpers = require('../helpers/response');

var Congress = {
  House: {},  /* State -> District -> Legislator */
  Senate: {}  /* State -> [Legislator] */
};

jsonfile.readFileSync("congress.json").forEach(function(legislator) {
  if (legislator.chamber == "house") {
    Congress.House[legislator.state] = Congress.House[legislator.state] || [];
    Congress.House[legislator.state][legislator.district] = new Legislator(legislator);
  } else {
    Congress.Senate[legislator.state] = Congress.Senate[legislator.state] || [];
    Congress.Senate[legislator.state].push(new Legislator(legislator));
  }
});

var get = function (req, res) {
  var state = req.query.state,
      district = req.query.district;

  if (!Object.keys(Congress.House).includes(state))
    res.status(400).json(resHelpers.makeError("Bad value for state parameter"));
  else if (!Object.keys(Congress.House[state]).includes(district))
    res.status(400).json(resHelpers.makeError("Bad value for district parameter"));
  else
    res.json(resHelpers.makeResponse([Congress.House[state][district]].concat(Congress.Senate[state])));
};


module.exports.get = get;
