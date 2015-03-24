/**
 * Tests for the API helper methods.
 */

var assert = require('assert');
var lodash = require('lodash');


describe('APIHelper', function() {

  it('should make a LegislatorFormElements model from a POTC response', function() {
    var simplifiedPOTCResponse = {
        'P000197': {
          'required_actions': [
            {
              'value': '$ADDRESS_ZIP5',
              'maxlength': null,
              'options_hash': null
            },
            {
              'value': '$TOPIC',
              'maxlength': null,
              'options_hash': {
                'Agriculture': 'AGR'
              }
            }
          ]
        }
    };

    var makeLFEModelFromPOTCResponse = require('../../../../server/routes/api/helpers/make_lfe_model_from_potc_response.js');
    var results = [];
    lodash.reduce(simplifiedPOTCResponse, function(result, val, bioguideId) {
      var lfeModel = makeLFEModelFromPOTCResponse(val, bioguideId);
      result.push(lfeModel);
    }, results);

    assert.equal(results.length, 1);
    var lfeModel = results[0];
    assert.equal(lfeModel.bioguideId, 'P000197');
    assert.equal(lfeModel.formElements.length, 2);
    assert.equal(lfeModel.formElements[0].value, '$ADDRESS_ZIP5');
    assert.equal(lfeModel.formElements[1].value, '$TOPIC');
    assert.equal(lfeModel.formElements[1].maxLength, null);
    assert.deepEqual(lfeModel.formElements[1].optionsHash, {'Agriculture': 'AGR'});
  });

});

