/**
 * Restricts access to designated URLs by IP address and time period.
 */

var bcrypt = require('bcrypt');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var redis = require('redis');
var tokenThrottleRedis = require('tokenthrottle-redis');

var IP_SALT = require('config').get('SERVER.CREDENTIALS.IP.SALT');

module.exports = function(config) {

  config = isEmpty(config) ? {} : config;
  // NOTE: requests are throttled using IP address as a key. That key is volatile in
  //       redis, with volatility of 1 week. That means that there are potentially
  //       some boundary effects v-a-v throttle boundaries, but this is a reasonable
  //       compromise between retaining IP addresses for max 7 days and managing a
  //       throttle.
  //       See http://redis.io/commands/expire for a discussion of expire functionality.
  // NOTE: contra the other time values, expiry is defined in seconds, not ms
  config.expiry = isUndefined(config.expiry) ? 7 * 24 * 60 * 60 : config.expiry;

  var redisOptions = config.get('REDIS');
  var redisClient = redis.createClient(
    redisOptions.PORT,
    redisOptions.HOSTNAME,
    {auth_pass: redisOptions.PASS}
  );
  // NOTE: values will be expired from Redis after the number of seconds (not ms!) specified for the
  //       expiry field in the config JSON files. See https://www.npmjs.com/package/tokenthrottle-redis
  //       options for where this is documented.
  var throttle = tokenThrottleRedis(config.get('THROTTLE'), redisClient);

  return function(req, res, next) {
    var ipAddr = req.ip;
    bcrypt.hash(ipAddr, IP_SALT, function (err, hashedIpAddr) {
      if (err) {
        next(new Error('could not throttle IP address'));
      }

      throttle.rateLimit(hashedIpAddr, function (err, limited) {
        if (limited) {
          res.statusCode = 429;
          next(new Error('too many requests'));
        } else {
          next();
        }
      });

    });

  };

};
