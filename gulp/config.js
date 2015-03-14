/**
 * Gulp task configuration.
 */

var path = require('path');
var gutil = require('gulp-util');
var sprintf = require('sprintf-js').sprintf;

var WWW_DIR = path.join(__dirname, '../www');
var BUILD_DIR = path.join(__dirname, '../.build');
var STATIC_DIR = path.join(__dirname, '../.build/static');


module.exports = {

  appSettings: {
    dest: BUILD_DIR,
    fileName: 'dioAppSettings.js',
    moduleName: 'dioConstants'
  },

  browserify: {
    debug: !gutil.env.production,
    entries: ['./www/js/app.js'],
    dest: path.join(STATIC_DIR, 'js'),
    outputName: 'dio.min.js'
  },

//  browserSync: {
//    proxy: sprintf.format('http://localhost:%d', process.env.PORT || 3000),
//    files: [
//      path.join(DIST_DIR, '/**/*'),
//      '!' + path.join(DIST_DIR, '/**.map')
//    ]
//  },

  img: {
    dest: path.join(STATIC_DIR, 'img'),
    paths: [
      path.join(WWW_DIR, 'img/**/*')
    ]
  },

  // TODO(leah): Autogen a settings service.

  test: {

  },

  partials: {
    dest: path.join(BUILD_DIR, 'partials'),
    paths: [
      path.join(WWW_DIR, 'partials/**/*.html')
    ],
    options: {
      filename: 'partials.js',
      module: 'democracyIoApp'
    }
  },

  sass: {
    dest: path.join(STATIC_DIR, 'css'),
    fileName: 'dio.min.css',
    paths: [
      path.join(WWW_DIR, 'sass/app.scss')
    ]
  }

};
