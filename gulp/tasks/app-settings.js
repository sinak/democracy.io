/**
 * Patches config settings from our config dir to a .js object usable by browserify.
 */

var config = require('config');
var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var path = require('path');
var rename = require('gulp-rename');

var gulpConfig = require('../config');
var version = require('../../package.json').version;

gulp.task('appSettings', function() {
  var appConfig = {
    dioConfig: config.get('WWW')
  };
  appConfig['dioConfig']['MODE'] = config.get('MODE');
  appConfig['dioConfig']['VERSION'] = version;

  return gulp.src('')
    .pipe(ngConstant({
      name: 'democracyIoApp',
      deps: false,
      constants: appConfig,
      wrap: 'commonjs'
    }))
    .pipe(rename('dio-app-settings.js'))
    .pipe(gulp.dest(gulpConfig.BUILD_DIR));


});
