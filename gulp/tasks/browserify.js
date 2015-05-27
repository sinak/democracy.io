/**
 * Bundle application js and component js to a single file.
 */

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var source = require('vinyl-source-stream');
var watchify  = require('watchify');

var bundleLogger = require('../util/bundle-logger');
var config = require('../config');
var handleErrors = require('../util/handle-errors');

gulp.task('browserify', function() {

  var bundler = browserify({
    cache: {}, packageCache: {}, fullPaths: true,
    entries: [
      './www/js/app.js'
    ],
    debug: !gutil.env.production
  });

  var reportFinished = function() {
    bundleLogger.end('dio.min.js');
  };

  var bundle = function() {
    bundleLogger.start('dio.min.js');

    return bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source('dio.min.js'))
      .pipe(gulp.dest(path.join(config.STATIC_DIR, 'js')))
      .on('end', reportFinished);
  };

  // If in watch mode, turn on watchify to re-bundle on changes
  if (global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }

  return bundle();
});
