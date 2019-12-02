// @ts-check
import { Handlers as SentryMiddleware } from "@sentry/node";
import * as express from "express";
import * as path from "path";
import { throttleProductionOnly } from "./middleware/ip-throttle";
import CaptchaSolutionRouter from "./routes/captcha-solution";
import LegislatorsRouter from "./routes/legislators";
import LocationRouter from "./routes/location";

var logger = require("./logger");
const app = express();

// exception tracking
app.use(SentryMiddleware.requestHandler());
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "deny");
  next();
});
// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable("trust proxy");

// logger
app.use((req, res, next) => {
  logger.info(`[Web] ${req.method} ${req.path} - ${res.statusCode}`, {
    params: req.params
  });
  next();
});

////////////////////////////////////////////////////////////////////////////////
// routes
// routes
app.use("/api", CaptchaSolutionRouter);

// Request throttling
// Disabled unless NODE_ENV === production
// Only throttle requests to the messages endpoints
app.use("/api/legislators/message", throttleProductionOnly());
app.use("/api", LegislatorsRouter);

app.use("/api", LocationRouter);

// static
app.use(express.static(path.join(__dirname, "../../www/build")));
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../www/build", "index.html"));
// });
////////////////////////////////////////////////////////////////////////////////

// error handlers - order dependent
app.use(SentryMiddleware.errorHandler());

export default app;
