/**
 * Helper to construct a LegislatorFormElements model from a POTC response.
 */

var lodash = require('lodash');

var models = require('../../../../models');


var makeLegislatorFormElementsFromPOTCResponse = function(potcResponse, bioguideId) {

  var formElems = lodash.map(potcResponse['required_actions'], function(action) {
    return {
      value: action.value,
      maxLength: action['maxlength'],
      optionsHash: action['options_hash']
    };
  });

  return new models.LegislatorFormElements({
    bioguideId: bioguideId,
    formElements: formElems
  });

};

module.exports = makeLegislatorFormElementsFromPOTCResponse;
