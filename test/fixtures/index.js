/**
 * Helper for loading test fixtures.
 */

var lodash = require('lodash');

var fixtures = require('require-dir')('.', {recurse: true});

/**
 * Gets a value from the fixture.
 * @param key
 * @returns {Object|Boolean}
 */
var getVal = function(key) {
  return lodash.get(this, key);
};


/**
 * Loads fixture data, attaching get and load methods.
 * @param key
 */
var load = function(key) {
  var val = lodash.get(this, key);

  if (lodash.isPlainObject(val)) {
    val.get = lodash.bind(getVal, val);
    val.load = lodash.bind(load, val);
  }

  return val;
};


fixtures.get = lodash.bind(getVal, fixtures);
fixtures.load = lodash.bind(load, fixtures);

module.exports = fixtures;
