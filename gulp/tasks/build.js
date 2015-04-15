/**
 *
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', function(cb) {
  runSequence(
    ['img', 'appSettings', 'partials', 'css'],
    'browserify',
    cb
  );
});