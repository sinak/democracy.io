/**
 * Create CSS file for use by the app.
 */

var autoprefixer = require('autoprefixer-core');
var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');

var config = require('../config');
var version = require('../../package.json').version;

gulp.task('css', function() {
  var stream = gulp.src(path.join(config.WWW_DIR, 'sass/app.scss'))
    .pipe(sass({
      includePaths: [config.NPM_DIR],
      functions: {
        'versionedDir()': function() {
          return 'test';
        }
      }
    }))
    .pipe(postcss([autoprefixer({ browsers: ['> 0.1%'] })]));

  if (process.env.NODE_ENV === 'production') {
    stream = stream
      .pipe(minifyCSS());
  }

  return stream
    .pipe(rename('dio.min.css'))
    .pipe(replace('{$VERSION}', version))
    .pipe(gulp.dest(path.join(config.STATIC_DIR, 'css')));
});
