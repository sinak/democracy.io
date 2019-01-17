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

// exception tracking
app.use(Sentry.Handlers.requestHandler());

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
// app.use(Sentry.Handlers.errorHandler());

module.exports = app;

const Legislators = require("./dio/Legislators");
const LegislatorsSearchUpdater = require("./dio/LegislatorsSearchUpdater");
const CongressLegislators = require("./services/CongressLegislators");

module.exports.startServer = async function() {
  const updater = new LegislatorsSearchUpdater(
    Legislators,
    CongressLegislators.fetchFile
  );
  await updater.update();

  const INTERVAL_IN_HOURS = 12;
  updater.schedule(INTERVAL_IN_HOURS * 60 * 60 * 1000);

  const port = process.env.PORT || 3000;
  app.listen(process.env.PORT || 3000, () => {
    logger.info("Server listening on port " + port);
  });
};
