/**
 * Sets up watches on templates and CSS files.
 */

var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');

var config = require('../config');


/**
 * NOTE: There are 4 forms of watches in operation:
 *   1. watchify for www .js files.
 *   2. this task for sass and partials
 *   3. browserSync for dust templates
 *   4. supervisor (see serve.js) for server-side .js files
 *
 * This is kind of complex, so if there's a way to simplify it, that would be great.
 */
gulp.task('watch', function() {
  gulp.watch(path.join(config.WWW_DIR, 'sass/**.scss'), ['css']);
  gulp.watch(path.join(config.WWW_DIR, 'partials/**/*.html'), function() {
    runSequence('partials');
  });
});
