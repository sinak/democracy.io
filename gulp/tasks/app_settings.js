/**
 * Patches config settings from our config dir to a .js object usable by browserify.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var ngConstant = require('gulp-ng-constant');
var path = require('path');
var rename = require('gulp-rename');

var config = require('../config').appSettings;
// Explicitly set the config dir, so that it gets pulled from www/config
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../../www/config');

gulp.task('appSettings', function() {
  var appConfig = {};
  appConfig[config.configVarName] = require('config');

  gulp.src('')
    .pipe(ngConstant({
      name: config.moduleName,
      deps: false,
      constants: appConfig,
      wrap: 'commonjs'
    }))
    .pipe(rename(config.fileName))
    .pipe(gulp.dest(config.dest));
});
