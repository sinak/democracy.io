/**
 * Bundle application js and component js to a single file.
 */

var browserify = require('browserify');
var gulp = require('gulp');
var path = require('path');
var source = require('vinyl-source-stream');
var minifyify = require('minifyify');
var watchify  = require('watchify');

var bundleLogger = require('../util/bundle-logger');
var config = require('../config');
var handleErrors = require('../util/handle-errors');

gulp.task('browserify', function() {

  var isProd = process.env.NODE_ENV === 'production';
  var bundler = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    entries: [
      './www/js/app.js'
    ],
    // NOTE: this is always true as minifyify requires it, even in prod mode
    debug: true
  });

  // NOTE: as debug is on, sourcemaps will be produced as a data URL and appended to the file.
  if (isProd) {
    bundler.plugin('minifyify', {
      map: '/static/js/bundle.map.js',
      output: path.join(config.STATIC_DIR, 'js/bundle.map.js')
    });
  }

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
