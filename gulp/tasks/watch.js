/**
 * Sets up watches on templates and CSS files.
 *
 * NOTE: watchify is used for .js files, so they're not watched here. This does mean
 *       that a complete watch requires the browserify task to be run, so it's added
 *       as a dependency here.
 */

var gulp  = require('gulp');
var config = require('../config');

gulp.task('watch', ['setWatch', 'browserify', 'browserSync'], function() {
  gulp.watch(config.sass.watch, ['css']);
  gulp.watch(config.partials.paths, ['partials', 'browserify']);
});
