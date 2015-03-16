/**
 * Create CSS file for use by the app.
 */

var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');

var config = require('../config').sass;

gulp.task('css', function() {
  gulp.src(config.paths)
    .pipe(sass({includePaths: config.includePaths}))
    .pipe(rename(config.fileName))
    .pipe(gulp.dest(config.dest));
});
