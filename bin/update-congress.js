
var request = require("request");
var yaml = require("js-yaml");
var jsonfile = require("jsonfile");

request("https://raw.githubusercontent.com/unitedstates/congress-legislators/master/legislators-current.yaml", function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var legislators = yaml.safeLoad(body);
    legislators = legislators.map(function(legislator) {
      var term = legislator.terms[legislator.terms.length-1];

      return {
        firstName: legislator.name.first,
        lastName: legislator.name.last,
        bioguideId: legislator.id.bioguide,
        chamber: term.type == "rep" ? "house" : "senate",
        title: term.type == "rep" ? "Rep" : "Sen",
        state: term.state,
        district: typeof term.district == "undefined" ? null : term.district.toString()
      };
    });

    jsonfile.writeFileSync("congress.json", legislators, { spaces: 2 });
  } else if (error) {
    console.error("Failed to fetch legislators-current.yaml", error);
  } else {
    console.error("Failed to fetch legislators-current.yaml",
                  "("+response.statusCode+" "+response.statusMessage+")");
  }
});
