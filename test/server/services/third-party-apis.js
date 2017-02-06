/**
 * Tests for the 3rd party API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var config = require('config').get('SERVER');
var eff = require('../../../server/services/third-party-apis/eff-civic-crm');
var potc = require('../../../server/services/third-party-apis/potc');
var smartyStreets = require('../../../server/services/third-party-apis/smarty-streets');


nestedDescribe('server.services.third-party-apis', function () {

  it('should make a POTC URL', function() {
    var potcURL = potc.makePOTCUrl(
      'test',
      config.get('API.POTC_BASE_URL'),
      config.get('CREDENTIALS.POTC.DEBUG_KEY')
    );

    expect(potcURL)
      .to.be.equal(config.get('API.POTC_BASE_URL')+'/test?debug_key='+config.get('CREDENTIALS.POTC.DEBUG_KEY'));
  });

  it('should make a SmartyStreets URL', function() {
    var ssURL = smartyStreets.makeSmartyStreetsUrl(
      config.get('API.SMARTY_STREETS.ADDRESS_URL'),
      'street-address',
      {'test': 'test'},
      {ID: 'fake-id', TOKEN: 'fake-token'}
    );
    expect(ssURL)
      .to.be.equal('https://api.smartystreets.com/street-address?test=test&auth-id=fake-id&auth-token=fake-token');
  });

  it('should make an EFF CivicCRM URL', function() {
    var effURL = eff.makeEFFCivicCRMUrl(
      config.get('API.EFF_CIVIC_CRM_URL'), 'civicrm/eff-action-api');
    expect(effURL)
      .to.be.equal('https://supporters.eff.org/civicrm/eff-action-api')
  });

});

