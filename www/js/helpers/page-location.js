/**
 * Helpers for page location and navigation.
 */

var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');

/**
 * Fetches details of the page state based on current path and history.
 * @param path
 * @param oldPageName
 * @param oldLocation
 * @returns {{pageFrom: string, pageName: string}}
 */
var getPageState = function(path, oldPageName, oldLocation) {
  var isNewSession = isUndefined(oldLocation);
  var strippedPath = path.substr(1);

  // New session if redirected from /
  if (!isUndefined(oldLocation) &&
      !isUndefined(oldLocation.$$route) &&
      oldLocation.$$route.originalPath === '') {
    isNewSession = true;
  }

  return {
    pageFrom: isNewSession ? 'new-visit' : oldPageName,
    pageName: isEmpty(strippedPath) ? 'home' : strippedPath
  };
};


module.exports.getPageState = getPageState;
