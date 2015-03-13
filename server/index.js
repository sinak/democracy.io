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
      // Kind of a hack, but ensures the kraken middleware deps get used
      krakenDir: path.join(__dirname, '../node_modules/kraken-js'),
      buildDir: path.join(__dirname, '../.build')
    }
  );

  return JSON.parse(meddlewareConfig);
};


var app = express();

var options = {
  onconfig: function (config, next) {
    app.locals['SITE_CONFIG'] = config.get('SITE_CONFIG');
    next(null, config);
  }
};

app.use(kraken(options));

app.on('start', function () {
  console.log('Application ready to serve requests.');
  console.log('Environment: %s', app.kraken.get('env:env'));
  // TODO(leah): For some reason the middleware gets called twice, once with meddled config
  //             values and once with standard. Setting this here means the last call, the
  //             one that takes effect, is done with meddled configs.
  app.use(meddleware(getMeddlewareConfig()));
});


module.exports = app;
