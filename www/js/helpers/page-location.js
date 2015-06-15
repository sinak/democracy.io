/**
 * Helpers for page location and navigation.
 */

var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');

/**
 * Fetches details of the page state based on current path and history.
 * @param path
 * @param oldLocation
 * @returns {{pageFrom: string, pageName: string}}
 */
var getPageState = function(path, oldPageName, oldLocation) {
  var isNewSession = isUndefined(oldLocation);
  var path = path.substr(1);

  return {
    pageFrom: isNewSession ? 'new-visit' : oldPageName,
    pageName: isEmpty(path) ? 'home' : path
  };
};


module.exports.getPageState = getPageState;
