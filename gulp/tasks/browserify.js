/**
 * Bundle application js and component js to a single file.
 */

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var watchify  = require('watchify');

var config = require('../config').browserify;
var bundleLogger = require('../util/bundle_logger');
var handleErrors = require('../util/handle_errors');

// 'appSettings', 'ngTemplates'
gulp.task('browserify', [], function() {

  var bundler = browserify({
    // Required watchify args
    cache: {}, packageCache: {}, fullPaths: true,
    entries: config.entries,
    debug: config.debug
  });

  var reportFinished = function() {
    // Log when bundling completes
    bundleLogger.end(config.outputName)
  };

  var bundle = function() {
    bundleLogger.start(config.outputName);

    return bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source(config.outputName))
      .pipe(gulp.dest(config.dest))
      .on('end', reportFinished);
  };

  // If in watch mode, turn on watchify to re-bundle on changes
  if (global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }

  return bundle();
});