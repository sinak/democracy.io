/**
 * Patches config settings from our config dir to a .js object usable by browserify.
 */

var config = require('config');
var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var path = require('path');
var rename = require('gulp-rename');
var fs = require('fs');

var gulpConfig = require('../config');
var version = require('../../package.json').version;

gulp.task('appSettings', function() {
  var appConfig = {
    dioConfig: config.get('WWW')
  };
  appConfig['dioConfig']['MODE'] = config.get('MODE');
  appConfig['dioConfig']['VERSION'] = version;

  return fs.mkdir(gulpConfig.BUILD_DIR, function() {
    fs.writeFileSync(gulpConfig.BUILD_DIR+'/'+'dio-app-settings.js',
                     'module.exports = '+JSON.stringify(appConfig['dioConfig'])+';');
  });
});
