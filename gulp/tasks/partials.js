/**
 * Builds an app cache module for all ng templates.
 */

var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');

var config = require('../config').partials;

gulp.task('partials', function() {
  gulp.src(config.paths)
    .pipe(templateCache(config.options))
    .pipe(gulp.dest(config.dest));
});
