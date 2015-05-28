/**
 * Tests for the message-form helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var helpers = require('../../../www/js/helpers/message-form');
var models = require('../../../models');


nestedDescribe('www.helpers.message-form', function() {

  it('should get topic options', function() {
    var legislatorsFormElements = [
      new models.LegislatorFormElements({
        bioguideId: 'A',
        formElements: [
          {
            value: '$TOPIC',
            maxLength: 100,
            optionsHash: {
              'fake_topic_1': 'fake_topic_1',
              'fake_topic_2': 'fake_topic_2'
            }
          }
        ]
      })
    ];
    var legislators = [
      new models.Legislator({
        bioguideId: 'A',
        title: 'Rep',
        lastName: 'LastName'
      })
    ];

    var topicOptions = helpers.getTopicOptions(legislatorsFormElements, legislators);
    var expectedTopicOptions = {
      A: {
        bioguideId: 'A',
         name: 'Rep. LastName',
         options: [ 'fake_topic_1', 'fake_topic_2' ],
         optionsHash: { fake_topic_1: 'fake_topic_1', fake_topic_2: 'fake_topic_2' },
         selected: 'fake_topic_1'
      }
    };
    expect(topicOptions)
      .to.be.deep.equal(expectedTopicOptions);

    // It shouldn't produce options where no $TOPIC field is present for a rep
    var noTopiclegislatorsFormElements = [
      new models.LegislatorFormElements({
        bioguideId: 'A',
        formElements: []
      })
    ];
    var noTopicOptions = helpers.getTopicOptions(noTopiclegislatorsFormElements, legislators);

    expect(noTopicOptions)
      .to.be.deep.equal({});

  });

  it('should get county options', function() {
    var legislatorsFormElements = [];
    var addressCounty = '';

    var countyData = helpers.getCountyData(legislatorsFormElements, addressCounty);
  })

});
