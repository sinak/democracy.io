/**
 * Tests for the geolocation helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var getUSCityRegionDataForIP = require('../../../server/services/geolocation').getUSCityRegionDataForIP;


nestedDescribe('server.services.geolocation', function () {

  it('should make geodata responses from supplied IP addresses', function() {
    // NOTE: these tests assume that you're using geoip-lite version 1.1.6
    // They may fail and need updating when the associated maxmind db changes.
    var carolinaPuertoRico = '24.41.255.255';
    var cupertinoCA = '17.255.255.255';
    var shrewsburyUK = '2.31.255.255';

    var prGeoData = getUSCityRegionDataForIP(carolinaPuertoRico);
    expect(prGeoData)
      .to.deep.equal({city: 'Carolina', region: null});

    var cupertinoGeoData = getUSCityRegionDataForIP(cupertinoCA);
    expect(cupertinoGeoData)
      .to.deep.equal({city: 'Cupertino', region: 'CA'});

    var shrewsburyGeoData = getUSCityRegionDataForIP(shrewsburyUK);
    expect(shrewsburyGeoData).to.be.null;
  });

});
