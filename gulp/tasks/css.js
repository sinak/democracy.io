/**
 * Create CSS file for use by the app.
 */

var gulp = require('gulp');
var sass = require('gulp-sass');

var config = require('../config').sass;

gulp.task('css', function() {
  gulp.src(config.paths)
    .pipe(sass())
    .pipe(gulp.dest(config.dest));
});
