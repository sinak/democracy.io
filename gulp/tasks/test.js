/**
 * Runs all application tests.
 */

var gulp = require('gulp');

var config = require('../config').test;

gulp.task('testFE', function() {

});

gulp.task('testServer', function() {

});

gulp.task('test', ['testFE', 'testServer'], function() {

});
