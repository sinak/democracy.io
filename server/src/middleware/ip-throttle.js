/**
 * Restricts access to designated URLs by IP address and time period.
 */

import Config from "./../config";
import * as crypto from "crypto";

/**
 *
 * @param {(hashedIpAddress: string) => Promise<boolean>} adapter
 */
export function createMiddleware(adapter) {
  /** @type {import("express").RequestHandler} */
  const middleware = async function ipThrottleMiddleware(req, res, next) {
    const defaultConfig = {
      expiry: 7 * 24 * 60 * 60
    };
    var ipAddr = req.ip;
    const hashedIpAddr = crypto
      .pbkdf2Sync(ipAddr, Config.REQUEST_THROTTLING_SALT, 10000, 32, "sha256")
      .toString("base64");
    let isThrottled;
    try {
      isThrottled = await adapter(hashedIpAddr);
      if (isThrottled) {
        res.sendStatus(429);
      } else {
        next();
      }
    } catch (err) {}
  };

  return middleware;
}
module.exports.createMiddleware = createMiddleware;

var tokenThrottleRedis = require("tokenthrottle-redis");

/**
 *
 * @param {object} throttleConfig
 * @param {number} throttleConfig.rate
 * @param {number} throttleConfig.expiry
 * @param {number} throttleConfig.window
 * @param {any} throttleConfig.overrides
 * @param {import("redis").RedisClient} redisClient
 */
export function createRedisAdapter(throttleConfig, redisClient) {
  // NOTE: requests are throttled using IP address as a key. That key is volatile in
  //       redis, with volatility of 1 week. That means that there are potentially
  //       some boundary effects v-a-v throttle boundaries, but this is a reasonable
  //       compromise between retaining IP addresses for max 7 days and managing a
  //       throttle.
  //       See http://redis.io/commands/expire for a discussion of expire functionality.
  // NOTE: contra the other time values, expiry is defined in seconds, not ms

  // NOTE: values will be expired from Redis after the number of seconds (not ms!) specified for the
  //       expiry field in the config JSON files. See https://www.npmjs.com/package/tokenthrottle-redis
  //       options for where this is documented.

  const throttle = tokenThrottleRedis(throttleConfig, redisClient);

  /**
   * @param {string} hashedIp
   * @returns {Promise<boolean>} IP is throttled
   */
  return function redisThrottler(hashedIp) {
    return new Promise((resolve, reject) => {
      throttle.rateLimit(hashedIp, (err, limited) => {
        if (err) reject(err);
        resolve(limited);
      });
    });
  };
}
module.exports.createRedisAdapter = createRedisAdapter;

export function mockBypassAdapter(_hashedIpAddr) {
  return Promise.resolve(false);
}
module.exports.mockBypassAdapter = mockBypassAdapter;

export function throttleProductionOnly() {
  if (process.env.NODE_ENV !== "production") {
    return mockBypassAdapter;
  } else {
    const redis = require("redis");
    var redisClient = redis.createClient(Config.REDIS_URL);

    const redisThrottleAdapter = createRedisAdapter(
      {
        rate: 200,
        window: 604800000,
        expiry: 604800,
        overrides: {
          "127.0.0.1": {
            rate: 0
          },
          "::1": {
            rate: 0
          },
          "::ffff:127.0.0.1": {
            rate: 0
          }
        }
      },
      redisClient
    );

    return createMiddleware(redisThrottleAdapter);
  }
}
