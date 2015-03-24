/**
 * Runs all application tests.
 */

var gulp = require('gulp');
var gulpExit = require('gulp-exit');
var gulpMocha = require('gulp-mocha');

var config = require('../config').test;

gulp.task('testFE', function() {

});

gulp.task('testServer', function() {
  return gulp.src(config.paths)
    .pipe(gulpMocha(config.mochaOptions))
    // NOTE: gulpExit is used here as otherwise the task hangs, see:
    //   github.com/sindresorhus/gulp-mocha/pull/31
    // exit will fail and test will hang if any error is emitted, even if it's from outside mocha
    // tests
    .pipe(gulpExit());
});

gulp.task('test', ['testFE', 'testServer'], function() {

});
