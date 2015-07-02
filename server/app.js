/**
 *
 */

var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var connectRedis = require('connect-redis');
var consolidate = require('consolidate');
var dust = require('dustjs-linkedin');
var express = require('express');
var expressEnrouten = require('express-enrouten');
var lusca = require('lusca');
var morgan = require('morgan');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var session = require('express-session');

// pm2 sets a NODE_APP_INSTANCE that causes problems with https://github.com/lorenwest/node-config/wiki/Strict-Mode
// As a workaround we move NODE_APP_INSTANCE aside during configuration loading
var appInstance = process.env.NODE_APP_INSTANCE;
process.env.NODE_APP_INSTANCE = '';
var config = require('config').get('SERVER');
config.VERSION = require('../package.json').version;
process.env.NODE_APP_INSTANCE = appInstance;

var apiResponse = require('./middleware/api-response');
var ipThrottle = require('./middleware/ip-throttle');
var ngXsrf = require('./middleware/ng-xsrf');
var swaggerizeWrapper = require('./middleware/swaggerize-wrapper');

var env = process.env.NODE_ENV || 'development';
// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
var buildDir = path.join(__dirname, '../.build');

var app = express();

app.locals['CONFIG'] = config;

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'dust');
// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable('trust proxy');

app.use(serveFavicon(path.join(buildDir, 'static', config.VERSION, 'img/favicon.ico')));
// NOTE: EFF doesn't use CDNs, so rely on static serve w/ a caching layer in front of it in prod
app.use(serveStatic(buildDir, config.get('STATIC')));
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
