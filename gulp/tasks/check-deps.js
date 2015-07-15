/**
 * Checks that installed dependencies match package.json.
 */

var checkDependencies = require('check-dependencies');
var gulp = require('gulp');
var forEach = require('lodash.foreach');


gulp.task('check-deps', function (cb) {
  var opts = {};

  checkDependencies(opts, function(result) {
    forEach(result.error, function (error) {
      console.log(error);
    });

    var err = result.depsWereOk ? null : new Error('one or more dependencies was missing or incorrectly specified');
    cb(err);
  });
});
