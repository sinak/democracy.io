/**
 * Sets up watches on templates and CSS files.
 *
 * NOTE: watchify is used for .js files, so they're not watched here. This does mean
 *       that a complete watch requires the browserify task to be run, so it's added
 *       as a dependency here.
 */

var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');

var config = require('../config');

gulp.task('watch', function() {
  gulp.watch(path.join(config.WWW_DIR, 'sass/**.scss'), ['css']);
  gulp.watch(path.join(config.WWW_DIR, 'partials/**/*.html'), function() {
    runSequence('partials');
  });
});
