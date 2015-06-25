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

  // TODO(leah): Should probably move this to the options
  // Use a *very* simple regex for now, just look for message in the path
  var pathRegex = /message/g;
  var targetedMethod = 'POST';

  var redisOptions = config.get('REDIS');
  var redisClient = redis.createClient(redisOptions.PORT, redisOptions.HOSTNAME, { auth_pass: redisOptions.PASS });
  var throttle = tokenThrottleRedis(config.get('THROTTLE'), redisClient);

  return function(req, res, next) {

    // NOTE: path is checked and restricted here due to an issue with working with
    //       swaggerize-express. For some reason using this middleware with a path
    //       restriction causes the underlying route to 404 every other time it's used.
    //       Essentially there's a deterministic coin-flip for whether the swaggerized
    //       router handler or this is called.
    //       If swaggerize - no throttling, if this - 404.
    //       So, rather than spending yet more time digging into swaggerize-express'
    //       internals, just do a path restriction here and move on.
    var path = req.path;

    if (path.match(pathRegex) && req.method === targetedMethod) {
      var ipAddr = req.ip;
      bcrypt.hash(ipAddr, IP_SALT, function (err, hashedIpAddr) {
        console.log(hashedIpAddr);
        if (err) {
          next(new Error('could not throttle IP address'));
        }

        throttle.rateLimit(hashedIpAddr, function (err, limited) {
          if (limited) {
            // Confusingly, the error handler mounted in swaggerize-wrapper will be
            // responsible for grabbing this error and returning a JSend formatted
            // response.
            // See swaggerize-wrapper for details.
            res.statusCode = 429;
            next(new Error('too many requests'));
          } else {
            next();
          }
        });

      });
    } else {
      next();
    }

  };

};
