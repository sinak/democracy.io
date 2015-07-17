/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var potcFixtures = require('../../../fixtures').load('routes.helpers.potc');
var potcHelpers = require('../../../../../server/routes/api/helpers/potc');
var models = require('../../../../../models');


nestedDescribe('server.routes.api.helpers.potc', function () {

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

    var results = lodash.reduce(simplifiedPOTCResponse, function (results, val, bioguideId) {
      results.push(potcHelpers.makeLegislatorFormElements(val, bioguideId));
      return results;
    }, []);

    expect(results).to.be.a('array');
    expect(results).to.have.length(1);

    var lfeModel = results[0];
    expect(lfeModel).to.be.an.instanceOf(models.LegislatorFormElements);

    expect(JSON.stringify(lfeModel))
      .to
      .equal(JSON.stringify(potcFixtures.load('legislatorFormElements').get('P000197')));
  });


  it('should make a POTC message from a Message model', function() {
    var msgFixtures = potcFixtures.load('messages');

    var robertsMessage = new models.Message(msgFixtures.get('roberts.message'));
    expect(potcHelpers.makePOTCMessage(robertsMessage, 'test'))
      .to.deep.equal(msgFixtures.get('roberts.potcMessage'));

    var vitterMessage = new models.Message(msgFixtures.get('vitter.message'));
    expect(potcHelpers.makePOTCMessage(vitterMessage, 'test'))
      .to.deep.equal(msgFixtures.get('vitter.potcMessage'));
  });

});
