/**
 * Create CSS file for use by the app.
 */

var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var rename = require('gulp-rename');
var sass = require('gulp-sass');

var config = require('../config');

gulp.task('css', function() {
  var stream = gulp.src(path.join(config.WWW_DIR, 'sass/app.scss'))
    .pipe(sass({
      includePaths: [config.NPM_DIR]
    }))
    .pipe(autoprefixer({ browsers: ['> 0.1%'] }))

  if (gutil.env.production) {
    stream = stream
      .pipe(minifyCSS())
  }

  return stream
    .pipe(rename('dio.min.css'))
    .pipe(gulp.dest(path.join(config.STATIC_DIR, 'css')));
});
