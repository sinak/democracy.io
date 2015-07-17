/**
 * Tests for the address-form helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var canonicalAddressJSON = require('../fixtures').get('canonical-address');
var helpers = require('../../../www/js/helpers/address-form');
var models = require('../../../models');


nestedDescribe('www.helpers.address-form', function() {

  var canonicalAddress = new models.CanonicalAddress(canonicalAddressJSON[0]);

  it('should validate an address response', function() {
    var serverErr = helpers.validateAddressResponse(new Error('fake server error'), null, '12345');
    expect(serverErr).to.equal(helpers.ADDRESS_ERR_LOOKUP.SERVER);
    var noAddressErr = helpers.validateAddressResponse(null, [], '12345');
    expect(noAddressErr).to.equal(helpers.ADDRESS_ERR_LOOKUP.UNRECOGNIZED);
    var mismatchedZipErr = helpers.validateAddressResponse(null, [canonicalAddress], '12345');
    expect(mismatchedZipErr).to.equal(helpers.ADDRESS_ERR_LOOKUP.MISMATCHED_ZIP);

    var validResponse = helpers.validateAddressResponse(null, [canonicalAddress], '11111');
    expect(validResponse).to.be.an.instanceof(models.CanonicalAddress);
  });

  it('should get default address data', function() {
    var defaultRes = helpers.getAddressData(undefined);
    expect(defaultRes).to.be.deep.equal({
      address: '',
      city: '',
      postal: ''
    });
  });

  it('should get address data from a canonical address', function() {
    var canonicalRes = helpers.getAddressData(canonicalAddress);
    expect(canonicalRes).to.be.deep.equal({
      address: '10 N Test St',
      city: 'Wichita, KS',
      postal: '11111'
    });
  });

});
