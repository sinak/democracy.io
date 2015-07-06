/**
 * Spin up the server and serve the app.
 */

var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');
var supervisor = require('gulp-supervisor');

var app = require('../../server/app');

gulp.task('supervisor', function() {
  // NOTE: This won't refresh the browser on server-side .js changes. As this is
  //       designed as a single-page app, that's considered fine.
  supervisor(path.join(__dirname, '../../server.js'), {
      watch: [
        path.join(__dirname, '../../server'),
        path.join(__dirname, '../../config')
      ],
      extensions: ['js', 'json']
  });
});

gulp.task('serve', function() {
  // Run supervisor first, so the express server is ready when browser-sync starts
  runSequence(
    'supervisor',
    'setWatch',
    ['build', 'watch'],
    'browserSync'
  );
});
