/**
 * Gulp task configuration.
 */

var path = require('path');
var gutil = require('gulp-util');
var sprintf = require('sprintf-js').sprintf;

var WWW_DIR = path.join(__dirname, '../www');
var BUILD_DIR = path.join(__dirname, '../.build');
var STATIC_DIR = path.join(__dirname, '../.build/static');
var SERVER_DIR = path.join(__dirname, '../server');
var NPM_DIR = path.join(__dirname, '../node_modules');

module.exports = {

  appSettings: {
    dest: BUILD_DIR,
    fileName: 'dioAppSettings.js',
    moduleName: 'democracyIoApp',
    configVarName: 'dioConfig'
  },

  browserify: {
    debug: !gutil.env.production,
    entries: [
      './www/js/app.js'
    ],
    dest: path.join(STATIC_DIR, 'js'),
    outputName: 'dio.min.js'
  },

  browserSync: {
    proxy: 'http://localhost:' + (process.env.PORT || 3000),
    files: [
      path.join(STATIC_DIR, '/**/*'),
      path.join(SERVER_DIR, 'templates/**/*.dust'),
      '!' + path.join(STATIC_DIR, '/**.map')
    ]
  },

  img: {
    dest: path.join(STATIC_DIR, 'img'),
    paths: [
      path.join(WWW_DIR, 'img/**/*')
    ]
  },

  templates: {
    paths: [
      path.join(SERVER_DIR, 'templates/**/*.dust')
    ]
  },

  test: {

  },

  partials: {
    dest: path.join(BUILD_DIR, 'partials'),
    paths: [
      path.join(WWW_DIR, 'partials/**/*.html')
    ],
    options: {
      filename: 'partials.js',
      module: 'democracyIoApp',
      root: '/partials'
    }
  },

  sass: {
    dest: path.join(STATIC_DIR, 'css'),
    fileName: 'dio.min.css',
    paths: [
      path.join(WWW_DIR, 'sass/app.scss')
    ],
    includePaths: [
      NPM_DIR
    ]
  }

};
