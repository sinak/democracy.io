/**
 * Tests for the 3rd party API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var potc = require('../../../server/services/third-party-apis/potc');
var smartyStreets = require('../../../server/services/third-party-apis/smarty-streets');
var sunlight = require('../../../server/services/third-party-apis/sunlight');


nestedDescribe('server.services.third-party-apis', function () {

  var config = {
    API: {
      SUNLIGHT_BASE_URL: 'https://sunlight.com',
      POTC_BASE_URL: 'https://potc.com',
      SMARTY_STREETS: {
        AUTOCOMPLETE_URL: 'https://autcomplete.ss.com',
        ADDRESS_URL: 'https://api.ss.com'
      }
    },
    CREDENTIALS: {
      SUNLIGHT: {
        API_KEY: 'fake-key'
      },
      POTC: {
        DEBUG_KEY: 'fake-key'
      },
      SMARTY_STREETS: {
        ID: 'fake-id',
        TOKEN: 'fake-token'
      }
    }
  };

  it('should make a sunlight foundation URL', function() {
    expect(sunlight.makeSunlightUrl('test', {'test': 'test'}, config))
      .to.be.equal('https://sunlight.com/test?test=test&apikey=fake-key');
  });

  it('should make a POTC URL', function() {
    expect(potc.makePOTCUrl('test', config))
      .to.be.equal('https://potc.com/test?debug_key=fake-key');
  });

  it('should make a SmartyStreets URL', function() {
    var ssURL = smartyStreets.makeSmartyStreetsUrl('https://autcomplete.ss.com', 'test', {'test': 'test'}, config);
    expect(ssURL)
      .to.be.equal('https://autcomplete.ss.com/test?test=test&auth-id=fake-id&auth-token=fake-token');
  });

});
