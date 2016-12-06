/**
 * Simple in memory cache to store bio and form data for representatives.
 */

var NodeCache = require('node-cache');
var isUndefined = require('lodash.isundefined');


/**
 * The defautl TTL for all cache keys, in seconds.
 * @type {number}
 */
var DEFAULT_TTL = 60 * 60 * 24 * 7;

var repCache = new NodeCache();


/**
 *
 * @param slug
 */
var getLegislatorByURLSlug = function(slug, cb) {
  repCache.get(slug, function(err, val) {
    if (err) {
      cb(err, null);
    }

    if (isUndefined(val)) {
      // ??

    } else {
      cb(null, val);
    }
  });
};


/**
 * Caches a legislator object.
 * @param legislator
 */
var cacheLegislator = function(legislator) {
  repCache.set(legislator.slug(), legislator);
  repCache.set(legislator.bioguideId, legislator);
};


/**
 * Returns legislator form elements for legislators matching the supplied bioguideIds.
 * @param bioguideIds {Array.<String>}
 */
var getFormElementsByBioguideIds = function(bioguideIds) {

};


module.exports.getLegislatorByURLSlug = getLegislatorByURLSlug;
module.exports.getFormElementsByBioguideIds = getFormElementsByBioguideIds;
