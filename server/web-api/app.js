/**
 * Router for all routes under /api/1
 *
 * NOTE: Although the API has a version number, for now it's basically meaningless. It's mostly
 *       there as a placeholder so that future versioned support can be dropped in if needed.
 */
const express = require("express");
const app = express();
const config = require("./../config");

function ipThrottleMiddleware() {
  if (process.env.NODE_ENV === "test") {
    return ipThrottle.mockBypassAdapter;
  } else {
    const redis = require("redis");
    var redisOptions = config.get("REQUEST_THROTTLING.REDIS");
    var redisClient = redis.createClient(
      redisOptions.PORT,
      redisOptions.HOSTNAME,
      {
        auth_pass: redisOptions.PASS
      }
    );

    const redisThrottleAdapter = ipThrottle.createRedisAdapter(
      config.get("REQUEST_THROTTLING.THROTTLE"),
      redisClient
    );

    return ipThrottle.createMiddleware(redisThrottleAdapter);
  }
}

// Request throttling
// Only throttle requests to the messages endpoints
var pathRe = /^\/api.*\/message$/;
const ipThrottle = require("../middleware/ip-throttle");
app.use(pathRe, ipThrottleMiddleware());

// routes
app.use(require("./captcha-solution"));
app.use(require("./exception"));
app.use(require("./form-elements"));
app.use(require("./legislator"));
app.use(require("./legislators"));
app.use(require("./location"));
app.use(require("./subscription"));
app.use(require("./exception"));

module.exports = app;
