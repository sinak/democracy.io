/**
 * Builds an app cache module for all ng templates.
 */

var gulp = require('gulp');
var path = require('path');
var templateCache = require('gulp-angular-templatecache');
var replace = require('gulp-replace');

var config = require('../config');
var version = require('../../package.json').version;

gulp.task('partials', function() {
  gulp.src(path.join(config.WWW_DIR, 'partials/**/*.html'))
    .pipe(templateCache({
      filename: 'partials.js',
      module: 'democracyIoApp',
      root: '/partials'
    }))
    .pipe(replace('{$VERSION}', version))
    .pipe(gulp.dest(path.join(config.BUILD_DIR, 'partials')));
});
