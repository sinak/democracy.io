import { Handlers as SentryMiddleware } from "@sentry/node";
import express from "express";
import * as path from "path";
import logger from "./logger";
import CaptchaSolutionRouter from "./routes/captcha-solution";
import LegislatorsRouter from "./routes/legislators";
import LocationRouter from "./routes/location";
import MessageRouter from "./routes/message";

const app = express();

// json parsing
app.use(express.json());

// exception tracking
app.use(SentryMiddleware.requestHandler());

// security
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "deny");
  next();
});

// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable("trust proxy");

// logger
app.use((req, res, next) => {
  logger.info(`[Web] ${req.method} ${req.path} - ${res.statusCode}`, {
    params: req.params,
  });
  next();
});

////////////////////////////////////////////////////////////////////////////////
// api routes
app.use("/api", CaptchaSolutionRouter);
app.use("/api", LegislatorsRouter);
app.use("/api", LocationRouter);
app.use("/api", MessageRouter);

// static routes - requires browser app to be built in `./www_dist` directory
//
// - development: run `npm run start` in `/www` to start the dev server
// - production: build the server using `npm run build` and
//   copy `/www/build` to `/server/dist/www_build
app.use(express.static(path.join(__dirname, "./www_build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./www_build", "index.html"));
});
////////////////////////////////////////////////////////////////////////////////

// error handlers - this must be last
app.use(SentryMiddleware.errorHandler());

export default app;
