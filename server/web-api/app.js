/**
 * Router for all routes under /api/1
 *
 * NOTE: Although the API has a version number, for now it's basically meaningless. It's mostly
 *       there as a placeholder so that future versioned support can be dropped in if needed.
 */
const express = require("express");
const app = express();
const config = require("./../config");

// Request throttling
// Only throttle requests to the messages endpoints
var pathRe = /^\/api.*\/message$/;
const ipThrottle = require("../middleware/ip-throttle");
const throttleAdapter =
  process.env.NODE_ENV === "test"
    ? ipThrottle.mockBypassAdapter
    : ipThrottle.createRedisAdapter(config.get("REQUEST_THROTTLING.THROTTLE"));
app.use(pathRe, ipThrottle.createMiddleware(throttleAdapter));

// routes
app.use(require("./captcha-solution"));
app.use(require("./exception"));
app.use(require("./form-elements"));
app.use(require("./legislator"));
app.use(require("./legislators"));
app.use(require("./location"));
app.use(require("./subscription"));

module.exports = app;
