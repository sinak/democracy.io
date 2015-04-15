/**
 * Spin up the server and serve the app.
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');

// setWatch is depended on here as browserify needs it set to turn on watchify
gulp.task('serve', function(cb) {
  runSequence(
    'setWatch',
    'build',
    'watch',
    'browserSync',
    function() {
      // This is a bit weird, but not a huge deal.
      var server = require('../../server');
      cb();
    }
  );
});
