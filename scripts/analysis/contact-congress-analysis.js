/**
 * Analysis script to parse the contents of the Member YAML files from:
 *   https://github.com/unitedstates/contact-congress
 */

var lodash = require('lodash');
var path = require('path');

var makeContactCongressStats = require('./contact-congress-stats').makeContactCongressStats;
var readMemberFiles = require('./parse-contact-congress').readMemberFiles;


var logAnalysisData = function(err, results) {

  if (err) {
    throw err;
  }

  var stats = makeContactCongressStats(results);
  console.log(stats.stepData.select);
};


var membersDir = path.join(process.argv.slice(2)[0], 'members');
readMemberFiles(membersDir, logAnalysisData);
