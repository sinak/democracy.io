/**
 *
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', function(cb) {
  runSequence(
    ['img', 'appSettings', 'partials', 'css','fonts'],
    'browserify',
    cb
  );
});


gulp.task('build:prod', function(cb) {
  process.env.NODE_ENV = 'production';
  gulp.run('build');
});