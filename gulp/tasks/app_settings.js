/**
 * Patches config settings from our config dir to a .js object usable by browserify.
 */

var config = require('config');
var gulp = require('gulp');
var gutil = require('gulp-util');
var ngConstant = require('gulp-ng-constant');
var path = require('path');
var rename = require('gulp-rename');

var appSettingsConfig = require('../config').appSettings;

gulp.task('appSettings', function() {
  var appConfig = {};

  appConfig[appSettingsConfig.configVarName] = config.get('WWW');
  appConfig[appSettingsConfig.configVarName]['MODE'] = config.get('MODE');

  gulp.src('')
    .pipe(ngConstant({
      name: appSettingsConfig.moduleName,
      deps: false,
      constants: appConfig,
      wrap: 'commonjs'
    }))
    .pipe(rename(appSettingsConfig.fileName))
    .pipe(gulp.dest(appSettingsConfig.dest));
});
