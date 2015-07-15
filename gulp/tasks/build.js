/**
 *
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');


var build = function(env) {
  process.env.NODE_ENV = env;
  return function(cb) {
    runSequence(
      ['img', 'appSettings', 'partials', 'css','fonts'],
      'browserify',
      cb
    );
  };
};

gulp.task('build', build('dev'));
gulp.task('build:prod', build('production'));
