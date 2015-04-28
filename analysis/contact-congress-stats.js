/**
 *
 */

var lodash = require('lodash');
var numeral = require('numeral');


var makeFillInStats = function(results) {

  var allFields = [];

  var stepCount = 0;
  lodash.forEach(results, function(res) {
    stepCount += res.stepData['fill_in'].length;
    allFields = lodash.flatten([allFields, res.stepData['fill_in']], true);
  });

  var distinctFields = lodash.union(allFields);
  var fieldCount = lodash.countBy(allFields);
  var percent;
  var fieldStats = lodash.mapValues(fieldCount, function(val, key) {
    percent = val / stepCount;
    return {percentage: numeral(percent).format('0.000%'), count: val};
  });

  return {
    distinct: distinctFields,
    stats: fieldStats
  };
};


var makeSelectStats = function(results) {

  var allSelectValues = [];
  var stepCount = 0;
  lodash.forEach(results, function(res) {
    stepCount += res.stepData['select'].length;

    lodash.forEach(res.stepData.select, function(selectVals) {
      lodash.forEach(selectVals, function(select) {
        allSelectValues.push(select.value);
      });
    });
  });

  var distinctFields = lodash.union(allSelectValues);
  var selectCount = lodash.countBy(allSelectValues);
  var percent;
  var selectStats = lodash.mapValues(selectCount, function(val) {
    percent = val / stepCount;
    return {percentage: numeral(percent).format('0.000%'), count: val};
  });

  return {
    distinct: distinctFields,
    stats: selectStats
  }
};


var stepStatFns = {
  'fill_in': makeFillInStats,
  'select': makeSelectStats
};


/**
 *
 * @param results
 */
var makeCCStats = function(results) {

  var allStepTypes = [];

  lodash.forEach(results, function(res) {
    allStepTypes.push(res.stepTypes);
  });
  allStepTypes = lodash.union.apply(this, allStepTypes);

  var stepData = {};
  var statsFn;
  lodash.forEach(allStepTypes, function(stepType) {
    statsFn = stepStatFns[stepType];

    if (!lodash.isUndefined(statsFn)) {
      stepData[stepType] = statsFn(results);
    }
  });

  var res = {
    stepTypes: allStepTypes,
    stepData: stepData
  };

  return res;
};


module.exports.makeContactCongressStats = makeCCStats;