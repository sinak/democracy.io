/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var apiHelpers = require('../../../www/js/helpers/api');
var models = require('../../../models');


nestedDescribe('www.helpers.APIHelpers', function() {

  it('should make an API URL', function() {
    expect(apiHelpers.makeRelativeAPIUrl('apiPath', 1, 'test'))
      .to.be.equal('/apiPath/1/test');
    expect(apiHelpers.makeRelativeAPIUrl('//apiPath', 1, '/test'))
      .to.be.equal('/apiPath/1/test');
  });

  it('should coerce a JSON response to a model response', function() {

    var sampleLegislators = [
      {
          "bioguideId": "P000197",
          "title": "Rep",
          "firstName": "Nancy",
          "lastName": "Pelosi"
      },
      {
          "bioguideId": "H001075",
          "title": "Sen",
          "firstName": "Kamala",
          "lastName": "Harris"
      }
    ];

    var modelLegislators = apiHelpers.coerceJSONResponseToModelResponse(
      sampleLegislators, models.Legislator);

    expect(modelLegislators).to.be.an('array')
      .with.length('2');

    var modelLegislator = apiHelpers.coerceJSONResponseToModelResponse(
      sampleLegislators[0], models.Legislator);

    expect(modelLegislator).to.be.an.instanceof(models.Legislator);

    lodash.forEach(sampleLegislators[0], function(val, key) {
      expect(modelLegislator).to.have.property(key)
        .that.deep.eqls(val);
    });

  });

});
