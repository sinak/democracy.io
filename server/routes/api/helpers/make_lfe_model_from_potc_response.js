/**
 *
 */

var lodash = require('lodash');

var FormElement = require('../../../models/form_element');
var LegislatorFormElements = require('../../../models/legislator_form_elements');


var makeLegislatorFormElementsFromPOTCResponse = function(potcResponse, bioguideId) {

  var formElems = lodash.map(potcResponse['required_actions'], function(action) {
    return new FormElement({
      value: action.value,
      maxLength: action['maxlength'],
      optionsHash: action['options_hash']
    });
  });

  return new LegislatorFormElements({
    bioguideId: bioguideId,
    formElements: formElems
  });

};

module.exports = makeLegislatorFormElementsFromPOTCResponse;
