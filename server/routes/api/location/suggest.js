/**
 * Fetches address suggestions via SmartyStreets.
 */

var changeCaseKeys = require('change-case-keys');
var lodash = require('lodash');

var AddressSuggestion = require('../../../../models').AddressSuggestion;
var geolocation = require('../../../services/geolocation');
var smartyStreets = require('../../../services/third-party-apis/smarty-streets');


var get = function (req, res) {
  var cb = function(response, err) {
    if (err === null) {
      var suggestions = lodash.map(response.suggestions, function(rawSuggestion) {
        return new AddressSuggestion(changeCaseKeys(rawSuggestion, 'camelize'));
      });
      res.json(suggestions);
    } else {
      // TODO(leah): Throw an error
    }
  };

  var usCityRegionData = geolocation.getUSCityRegionDataForIP(req.ip);
  var preferenceStr = geolocation.makePreferenceStringFromUSCityRegionData(usCityRegionData);
  var params = {
    prefix: req.params.address,
    geolocate: false // Initial tests with this flag set to true didn't produce noticeably more
                     // usable results than w/out. It's also unclear whether the API will honor
                     // X-Forwarded etc, so set false and rely on setting the preferencing values
  };

  // Set SS preferencing options to bias the results. Without this, the result quality is
  // typically very generic even as queries get fairly specific.
  if (!lodash.isNull(preferenceStr)) {
    params.prefer = preferenceStr;
  }

  smartyStreets.suggestAddresses(params, req.app.locals.CONFIG, cb);
};


module.exports.get = get;

