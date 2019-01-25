var express = require("express");
var lusca = require("lusca");
var logger = require("./logger");
var config = require("./config");
var Sentry = require("@sentry/node");
var app = express();

Sentry.init({
  dsn: config.CREDENTIALS.SENTRY_DSN,
  disabled: process.env.NODE_ENV === "test"
});

// exception tracking
app.use(Sentry.Handlers.requestHandler());

app.locals["CONFIG"] = config;


// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable("trust proxy");

// security
app.use(
  lusca({
    csrf: false,
    xframe: "SAMEORIGIN",
    p3p: false,
    csp: false
  })
);

// logger
app.use((req, res, next) => {
  logger.info(`[Web] ${req.method} ${req.path} - ${res.statusCode}`, {
    params: req.params
  });
  next();
});

// routes
const path = require("path");
const swaggerMiddleware = require("swagger-express-middleware");
var BUILD_DIR = path.join(__dirname, "../.build");
var apiDef = require(path.join(BUILD_DIR, "api.json"));

// api
swaggerMiddleware(apiDef, app, function(err, middleware) {
  if (err) throw err;

  // NOTE: install the swagger middleware at the top level of the app. This is required
  //       as otherwise the path param is missing the /api/1 prefix and swagger metadata
  //       doesn't get attached correctly in:
  //          swagger-express-middleware/lib/request-metadata.js#swaggerPathMetadata
  app.use(middleware.metadata());
  app.use(middleware.parseRequest());
  app.use(middleware.validateRequest());
  app.use(apiDef.basePath, require("./web-api/app"));
});

// static
app.use(require("./web-static/app"));

// error handlers - order dependent
app.use(Sentry.Handlers.errorHandler());

module.exports = app;