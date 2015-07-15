/**
 * Syncs the browser as changes are made.
 */

var gulp = require('gulp');
var path = require('path');

var browserSyncInstance = require('../util/browser-sync-instance');
var config = require('../config');

gulp.task('browserSync', function() {
  browserSyncInstance.init({
    proxy: 'http://localhost:' + (process.env.PORT || 3000),
    port: 7000,
    ui: {
      port: 7001
    }
  });
});
