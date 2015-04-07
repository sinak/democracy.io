/**
 * Fetches address suggestions via SmartyStreets.
 */

var changeCaseKeys = require('change-case-keys');

var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  res.json([]);
};


module.exports.get = get;
