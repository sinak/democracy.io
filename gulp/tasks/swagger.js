/**
 * Custom task to resolve $ref links and create a complete Swagger doc.
 */

var async = require('async');
var gulp = require('gulp');
var jsonfile = require('jsonfile');
var lodash = require('lodash');
var path = require('path');

var taskConfig = require('../config');


var resolveRef = function(objDef, basePath, cb) {
  if (lodash.has(objDef, '$ref')) {
    jsonfile.readFile(path.join(basePath, objDef['$ref']), function(err, resolvedObj) {
      if (err) {
        cb(err, null);
      }
      cb(null, resolvedObj);
    });
  } else {
    cb(null, objDef);
  }
};

var resolveRefs = function(json, basePath, cb) {
  lodash.forEach(json, function(val, key) {
    json[key] = lodash.partial(resolveRef, val, basePath);
  });

  async.parallel(json, function(err, results) {
    cb(err, results);
  });
};


gulp.task('swagger', function(done) {
  var swaggerDir = path.join(taskConfig.SERVER_DIR, 'swagger')
  var apiJSON = require(path.join(swaggerDir, 'api.json'));

  async.parallel({
      paths: function(cb) {
        resolveRefs(apiJSON.paths, swaggerDir, cb);
      },
      defs: function(cb) {
        resolveRefs(apiJSON.definitions, swaggerDir, cb);
      }
    },
    function(err, res) {
      apiJSON.paths = res.paths;
      apiJSON.definitions = res.defs;
      jsonfile.writeFile(path.join(taskConfig.BUILD_DIR, 'api.json'), apiJSON, {spaces: 2}, function() {
        done();
      });
    }
  );

});
