/**
 * Syncs the browser as changes are made.
 */

var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var path = require('path');

var config = require('../config');

gulp.task('browserSync', function() {
  browserSync.init({
    proxy: 'http://localhost:' + (process.env.PORT || 3000),
    port: 7000,
    ui: {
      port: 7001
    },
    files: [
      path.join(config.STATIC_DIR, '/**/*'),
      path.join(config.SERVER_DIR, 'templates/**/*.dust'),
      '!' + path.join(config.STATIC_DIR, '/**.map')
    ]
  });
});
