/**
 * Functions to parse the contact-congress YAML files and return a data structure with useful info.
 */

var async = require('async');
var fs = require('fs');
var lodash = require('lodash');
var path = require('path');
var yaml = require('js-yaml');


var parseFillInData = function(fields) {
  var fieldValues = [];

  for (var i = 0, field; i < fields.length; ++i) {
    field = fields[i];

    // There are some examples of fields with value of empty string, e.g. reps C000127, C001071 etc.
    // These fields appear to be a mix of oddly coded values (mphone) and some kind of
    // identifiers, possibly session or user ids, e.g. field_dbe73130-2c88-447b-bb88-8a097e611511
    // If there's no value, skip the field
    if (field.value !== '') {
      fieldValues.push(field.value);
    }
  }

  return fieldValues;
};


var parseSelectData = function(selects) {
  var selectValues = [];

  for (var i = 0, select; i < selects.length; ++i) {
    select = selects[i];

    selectValues.push({
      value: select.value,
      options: select.options
    });
  }

  return selectValues;
};


/**
 * Functions for parsing data for a particular step type.
 *
 * The set of possible steps is:
 *   - visit
 *   - fill_in
 *   - click_on
 *   - find
 *   - select
 *   - choose
 *   - check
 *   - wait
 *   - uncheck
 *
 *   ... of these, we care about fill_in and select
 *
 * @type {{}}
 */
var stepParserFns = {
  'fill_in': parseFillInData,
  'select': parseSelectData
};


/**
 *
 * @param memberData
 */
var parseMemberData = function(memberData) {
  var bioguideId = memberData.bioguide;
  var steps = memberData['contact_form'].steps;

  var res = {
    bioguideId: bioguideId,
    stepTypes: [],
    stepData: {
      'fill_in': [],
      select: []
    }
  };

  for (var i = 0, step, stepType, parser, stepData; i < steps.length; ++i) {
    step = steps[i];
    stepType = lodash.keys(step)[0];
    res.stepTypes.push(stepType);

    parser = stepParserFns[stepType];

    if (!lodash.isUndefined(parser)) {
      stepData = parser(step[stepType]);
      res.stepData[stepType].push(stepData);
    }
  }

  return res;
};


/**
 *
 * @param memberFile
 */
var readMemberFile = function(memberFile, cb) {
  fs.readFile(memberFile, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    try {
      var memberData = parseMemberData(yaml.safeLoad(data));
      cb(null, memberData);
    } catch (err) {
      cb(err, null);
    }
  });
};


/**
 * Returns an array of objects describing the contents of member YAML files.
 *
 * Objects are structured like:
 *   {
 *     bioguideId: 'A1001',
 *     stepTypes: ['visit', 'fill_in', ...],
 *     stepData: [
 *       'fill_in': [...],
 *       ...
 *     ]
 *   }
 *
 * @param membersDir
 * @param cb
 */
var readMemberFiles = function(membersDir, cb) {
  fs.readdir(membersDir, function(err, files) {

    if (err) {
      throw err;
    }

    var yamlFiles = lodash.filter(files, function(filename) {
      var isDir = fs.statSync(path.join(membersDir, filename)).isDirectory();
      // Exclude directories and files beginning with .
      return !isDir && !(filename.indexOf('.') === 0)
    });

    var tasks = lodash.map(yamlFiles, function(yamlFile) {
      return lodash.partial(readMemberFile, path.join(membersDir, yamlFile));
    });

    async.parallel(tasks, cb);
  });
};


module.exports.readMemberFiles = readMemberFiles;