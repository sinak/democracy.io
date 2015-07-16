/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');

var helpers = require('../../../../../server/routes/api/helpers/api');
var models = require('../../../../../models');


nestedDescribe('server.routes.api.helpers.api', function () {

  var sampleData = [
    {
      bioguideId: 'test-one',
      answer: 'answer-one',
      uid: 'uid-one'
    },
    {
      bioguideId: 'test-two',
      answer: 'answer-two',
      uid: 'uid-two'
    }
  ];

  var testModel = function(model, num) {
    expect(model).to.have.property('bioguideId', 'test-' + num);
    expect(model).to.have.property('answer', 'answer-' + num);
    expect(model).to.have.property('uid', 'uid-' + num);
  };

  it('should make a model response from a data object', function() {
    var modelObj = helpers.getModelData(sampleData[0], models.CaptchaSolution);
    expect(modelObj).to.be.an.instanceof(models.CaptchaSolution);
    testModel(modelObj, 'one');
  });

  it('should make an array of model responses from an array of data objects', function() {
    var modelObjs = helpers.getModelData(sampleData, models.CaptchaSolution);
    expect(modelObjs).to.have.length(2);
    testModel(modelObjs[0], 'one');
    testModel(modelObjs[1], 'two');
  });

});
