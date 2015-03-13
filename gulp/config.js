/**
 * Gulp task configuration.
 */

var path = require('path');
var gutil = require('gulp-util');
var sprintf = require('sprintf-js').sprintf;

var WWW_DIR = path.join(__dirname, '../www');
var BUILD_DIR = path.join(__dirname, '../.build/static');


module.exports = {

  browserify: {
    debug: !gutil.env.production,
    entries: ['./www/js/app.js'],
    dest: path.join(BUILD_DIR, 'js'),
    outputName: 'democracyio.min.js'
  },

//  browserSync: {
//    proxy: sprintf.format('http://localhost:%d', process.env.PORT || 3000),
//    files: [
//      path.join(DIST_DIR, '/**/*'),
//      '!' + path.join(DIST_DIR, '/**.map')
//    ]
//  },

  css: {
    dest: path.join(BUILD_DIR, 'css'),
    paths: [
      path.join(WWW_DIR, 'css/app.scss')
    ]
  },

  // TODO(leah): Autogen a settings service.

  test: {

  }

};
