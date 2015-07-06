/**
 * Runs all application tests.
 */

var gulp = require('gulp');
var gulpMocha = require('gulp-mocha');
var path = require('path');

var config = require('../config');


gulp.task('testFE', function() {

});

gulp.task('testServer', function() {
  return gulp.src(path.join(config.TEST_DIR, '**/*.js'))
    .pipe(gulpMocha({
      reporter: 'spec'
    }))
    .once('error', function () {
      process.exit(1);
    })
    .once('end', function () {
      process.exit();
    });
});

gulp.task('test', ['testFE', 'testServer'], function() {

});
