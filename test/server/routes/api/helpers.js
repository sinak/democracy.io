/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');


nestedDescribe('server.routes.api.helpers', function () {

  it('should make a LegislatorFormElements model from a POTC response', function () {
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
    lodash.reduce(simplifiedPOTCResponse, function (result, val, bioguideId) {
      var lfeModel = makeLFEModelFromPOTCResponse(val, bioguideId);
      result.push(lfeModel);
    }, results);

    expect(results).to.be.a('array');
    expect(results).to.have.length(1);

    var lfeModel = results[0];
    expect(lfeModel).to.have.property('bioguideId')
      .that.equals('P000197');
    expect(lfeModel).to.have.property('formElements')
      .that.is.an('array')
      .that.has.length(2);

    var formElem = lfeModel.formElements[1];
    expect(formElem).to.have.property('value')
      .that.equals('$TOPIC');
    expect(formElem).to.have.property('maxLength')
      .that.is.null;
    expect(formElem).to.have.property('optionsHash')
      .that.is.an('object')
      .that.deep.equals({'Agriculture': 'AGR'});
  });
});
