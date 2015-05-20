/**
 *
 */

var path = require('path');

var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('config');
var consolidate = require('consolidate');
var dust = require('dustjs-linkedin');
var express = require('express');
var expressEnrouten = require('express-enrouten');
var lusca = require('lusca');
var morgan = require('morgan');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var session = require('express-session');

var apiResponse = require('./middleware/api-response');
var ngXsrf = require('./middleware/ng-xsrf');
var swaggerizeWrapper = require('./middleware/swaggerize-wrapper');

// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
//       This is due to our not knowing the deploy env at the current time.
var buildDir = path.join(__dirname, '../.build');

var app = express();

app.locals['CONFIG'] = config.get('SERVER');

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'dust');

app.use(serveFavicon(path.join(buildDir, 'static/img/favicon.ico')));
app.use(serveStatic(buildDir, {}));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  key: 'connect.sid',
  secret: 'keyboard cat',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: null
  },
  resave: true,
  saveUninitialized: true,
  // TODO(leah): figure out how to inherit this from express
  proxy: false
}));
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  p3p: false,
  csp: false
}));
app.use(ngXsrf());
app.use(expressEnrouten({directory: 'routes'}));
app.use(apiResponse({
  namespace: 'DIO_API'
}));
app.use(swaggerizeWrapper({
  'api': path.join(__dirname, 'api.json'),
  'handlers': path.join(__dirname, 'routes/api')
}));


app.on('start', function () {
  console.log('Application ready to serve requests.');
  console.log('Environment: %s', app.kraken.get('env:env'));
});


module.exports = app;
