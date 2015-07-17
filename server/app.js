/**
 *
 */

var connectRedis = require('connect-redis');
var consolidate = require('consolidate');
var dust = require('dustjs-linkedin');
var express = require('express');
var lusca = require('lusca');
var middleware = require('swagger-express-middleware');
var morgan = require('morgan');
var path = require('path');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var session = require('express-session');

// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
var BUILD_DIR = path.join(__dirname, '../.build');

var apiDef = require(path.join(BUILD_DIR, 'api.json'));
var apiErrorHandler = require('./middleware/api-error-handler');
var config = require('./config');
var ipThrottle = require('./middleware/ip-throttle');
var ngXsrf = require('./middleware/ng-xsrf');

var app = express();

app.locals['CONFIG'] = config;

app.engine('dust', consolidate.dust);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'dust');
// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable('trust proxy');

app.use(serveFavicon(path.join(BUILD_DIR, 'static', config.VERSION, 'img/favicon.ico')));
// NOTE: EFF doesn't use CDNs, so rely on static serve w/ a caching layer in front of it in prod
app.use(serveStatic(BUILD_DIR, config.get('STATIC')));
app.use(morgan('combined'));

// Only throttle requests to the messages endpoints
var pathRe = /^\/api.*\/message$/;
app.use(pathRe, ipThrottle(config.get('REQUEST_THROTTLING')));

var RedisStore = connectRedis(session);
// Default to the same ttl as used by the request throttle
app.use(session({
  store: new RedisStore({ttl: config.get('REQUEST_THROTTLING.THROTTLE.expiry') || 7 * 24 * 60 * 60}),
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


var port = process.env.PORT || 3000;
middleware(apiDef, app, function(err, middleware) {
  if (err) {
    throw err;
  }

  // NOTE: install the swagger middleware at the top level of the app. This is required
  //       as otherwise the path param is missing the /api/1 prefix and swagger metadata
  //       doesn't get attached correctly in:
  //          swagger-express-middleware/lib/request-metadata.js#swaggerPathMetadata
  app.use(middleware.metadata());
  app.use(middleware.parseRequest());
  app.use(middleware.validateRequest());
  app.use(apiErrorHandler());

  var appRouter = require('./routes/app/router')([ngXsrf()]);
  app.use(appRouter);

  var apiRouter = require('./routes/api/router')();
  app.use(apiDef.basePath, apiRouter);

  app.listen(port, function () {
    console.log('Server listening on http://localhost:%s', port);
    console.log('Application ready to serve requests.');
  });
});


module.exports = app;
