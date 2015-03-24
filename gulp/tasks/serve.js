/**
 * Spin up the server and serve the app.
 */

var gulp = require('gulp');

// setWatch is depended on here as browserify needs it set to turn on watchify
gulp.task('serve', ['setWatch', 'build', 'watch'], function() {
  // This is a bit weird, but not a huge deal.
  var server = require('../../server');
});
