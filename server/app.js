/**
 *
 */

var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var connectRedis = require('connect-redis');
var config = require('config').get('SERVER');
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
var ipThrottle = require('./middleware/ip-throttle');
var ngXsrf = require('./middleware/ng-xsrf');
var swaggerizeWrapper = require('./middleware/swaggerize-wrapper');

var env = process.env.NODE_ENV || 'development';
// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
//       This is due to our not knowing the deploy env at the current time.
var buildDir = path.join(__dirname, '../.build');

var app = express();

app.locals['CONFIG'] = config;

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'dust');
app.enable('trust proxy');

app.use(serveFavicon(path.join(buildDir, 'static/img/favicon.ico')));
if (env === 'development') {
  app.use(serveStatic(buildDir, {}));
}
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// See NOTE in ipThrottle for why this isn't regex restricted to msg routes
app.use(ipThrottle(config.get('REQUEST_THROTTLING')));
var RedisStore = connectRedis(session);

app.use(session({
  store: new RedisStore({ttl: 7 * 24 * 60 * 60}),
  key: 'connect.sid',
  secret: config.get('CREDENTIALS').get('SESSION.SECRET'),
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
