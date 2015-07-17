/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');

var helpers = require('../../../../../server/routes/api/helpers/smarty-streets');
var models = require('../../../../../models');
var ssFixtures = require('../../../fixtures').load('routes.third-party-api.smarty-streets');


nestedDescribe('server.routes.api.helpers.smarty-streets', function () {

  it('should make a canonical address from a smarty-streets raw address', function() {
    var res = helpers.makeCanonicalAddressFromSSResponse(ssFixtures[0]);
    expect(res.address).to.equal('100 Test St, San Francisco CA 94110-2907');
    expect(res).to.be.instanceof(models.CanonicalAddress);
  });

});
