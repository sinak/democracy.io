/**
 * Create CSS file for use by the app.
 */

var addsrc = require('gulp-add-src');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var gulp = require('gulp');
var lodash = require('lodash');
var sass = require('gulp-sass');

var config = require('../config').sass;

gulp.task('css', function() {
  var cssStream = gulp.src(config.paths)
    .pipe(sass({includePaths: config.includePaths}))
    .pipe(autoprefixer({ browsers: ['> 0.1%'] }));

  if (!lodash.isEmpty(config.concatPaths)) {
    cssStream = cssStream.pipe(addsrc.append(config.concatPaths));
  }

  cssStream
    .pipe(concat(config.fileName))
    .pipe(gulp.dest(config.dest));
});
