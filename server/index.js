/**
 *
 */

var express = require('express');
var fs = require('fs');
var kraken = require('kraken-js');
var lodash = require('lodash');
var meddleware = require('meddleware');
var path = require('path');
var sprintf = require('sprintf-js').sprintf;


/**
 * Fetch the meddleware config and switch module paths to be absolute.
 *
 * This is required as this file doesn't have a relative node_modules dir and meddleware
 * doesn't support setting the basedir for module resolution.
 */
var getMeddlewareConfig = function() {
  var meddlewareConfig = JSON.stringify(require('shush')('./config/middleware'));
  meddlewareConfig = sprintf(
    meddlewareConfig,
    {
      serverDir: __dirname,
      krakenDir: '../node_modules/kraken-js' // Kind of a hack, but ensure that the kraken
                                             // middleware deps get used
    }
  );

  return JSON.parse(meddlewareConfig);
};


var options = {
  onconfig: function (config, next) {
    next(null, config);
  }
};

var app = express();
app.use(meddleware(getMeddlewareConfig()));
app.use(kraken(options));

app.on('start', function () {
  console.log('Application ready to serve requests.');
  console.log('Environment: %s', app.kraken.get('env:env'));
});


module.exports = app;
