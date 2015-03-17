var gulp = require('gulp');

gulp.task('setWatch', function(cb) {
  global.isWatching = true;
  cb();
});
