/**
 *
 */

var express = require('express');
var fs = require('fs');
var kraken = require('kraken-js');
var lodash = require('lodash');
var path = require('path');
var swaggerize = require('swaggerize-express');

var app = express();

var options = {
  onconfig: function (config, next) {
    app.locals['CONFIG'] = config.get('CONFIG');
    next(null, config);
  }
};

app.use(kraken(options));
// Enabled so that req.ip will pull IP address from the X-Forwarded header, see:
//   http://expressjs.com/guide/behind-proxies.html
app.enable('trust proxy');

app.use(swaggerize({
  api: path.join(__dirname, '/api.json'),
  handlers: path.join(__dirname, './routes/api')
}));

app.on('start', function () {
  console.log('Application ready to serve requests.');
  console.log('Environment: %s', app.kraken.get('env:env'));
});


module.exports = app;
