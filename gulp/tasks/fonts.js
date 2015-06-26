/**
* Copies fonts to the build directories.
*/

var gulp = require('gulp');
var gulpChanged = require('gulp-changed');
var path = require('path');

var config = require('../config');

gulp.task('fonts', function() {
  var fontDest = path.join(config.STATIC_DIR, 'fonts');

  gulp.src(path.join(config.WWW_DIR, 'fonts/**/*'))
    .pipe(gulpChanged(fontDest))
    .pipe(gulp.dest(fontDest));
});
