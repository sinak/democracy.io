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
    .pipe(gulpMocha(config.mochaOptions));
});

gulp.task('test', ['testFE', 'testServer'], function() {

});
