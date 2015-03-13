/**
* Copies app images to the build directories.
*/

var gulp = require('gulp');
var gulpChanged = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var path = require('path');

var config = require('../config').img;

gulp.task('img', function() {
  gulp.src(config.paths)
    .pipe(gulpChanged(config.dest))
    .pipe(imagemin({
      multipass: true,
      optimizationLevel: 1,
      progressive: true
    }))
    .pipe(gulp.dest(config.dest));
});
