
var jsonfile = require("jsonfile");
var Legislator = require("../../models").Legislator;

var Congress = {
  House: {},    /* State -> District -> Legislator */
  Senate: {},   /* State -> [Legislator] */
  Members: {},  /* Bioguide -> Legislator */

  validDistrict: function(state, district) {
    if (!state || !district) {
      var message = "Error: Blank state or district"
      return message;
    }
    if (Congress.House[state] != undefined && Congress.House[state][district] != undefined) {
      return true;
    }
    else if (Congress.Senate[state] === undefined) {
      var message = "Error: Senator for state " + state + " not found.";
      return message;
    }
    else {
      var message = "Error: Representative for " + state + "-" + district + " not found.";
      return message;
    } 
  },

  getLegislators: function(state, district) {
    if (Congress.House[state]) {
      var rep = Congress.House[state][district];
    }
    var senators = Congress.Senate[state];
    return senators ? [rep].concat(senators) : [rep];
  }
};

jsonfile.readFileSync("congress.json").forEach(function(legislator) {
  var legislator = new Legislator(legislator);
  if (legislator.title == "Rep") {
    Congress.House[legislator.state] = Congress.House[legislator.state] || [];
    Congress.House[legislator.state][legislator.district] = legislator;
  } else {
    Congress.Senate[legislator.state] = Congress.Senate[legislator.state] || [];
    Congress.Senate[legislator.state].push(legislator);
    Congress.Senate[legislator.state].sort(function(x,y) {
      return x.bioguideId < y.bioguideId ? -1 : 1;
    });
  }
  Congress.Members[legislator.bioguideId] = legislator;
});

module.exports = Congress;
