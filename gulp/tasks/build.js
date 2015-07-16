/**
 *
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');


var build = function(env) {

  return function(cb) {
    process.env.NODE_ENV = env;
    runSequence(
      ['img', 'appSettings', 'partials', 'css','fonts'],
      'browserify',
      cb
    );
  };
};

gulp.task('build', build('development'));
gulp.task('build:prod', build('production'));
