/**
 * Sets up watches on templates and CSS files.
 *
 * NOTE: watchify is used for .js files, so they're not watched here.
 */

var gulp  = require('gulp');
var config = require('../config');

gulp.task('watch', ['runServer', 'setWatch', 'browserSync'], function() {

});
