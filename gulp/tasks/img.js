/**
* Copies app images to the build directories.
*/

var gulp = require('gulp');
var gulpChanged = require('gulp-changed');
var imageMin = require('gulp-imagemin');
var path = require('path');

var config = require('../config');

gulp.task('img', function() {
  var imgDest = path.join(config.STATIC_DIR, 'img');

  gulp.src(path.join(config.WWW_DIR, 'img/**/*'))
    .pipe(gulpChanged(imgDest))
    .pipe(imageMin({
      multipass: true,
      optimizationLevel: 1,
      progressive: true
    }))
    .pipe(gulp.dest(imgDest));
});
