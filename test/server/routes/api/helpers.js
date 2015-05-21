/**
 * Tests for the API helper methods.
 */

var expect = require('chai').expect;
var lodash = require('lodash');
var nestedDescribe = require('nested-describe');

var Message = require('../../../../models').Message;
var helpers = require('../../../../server/routes/api/helpers/potc');


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

    var results = lodash.reduce(simplifiedPOTCResponse, function (results, val, bioguideId) {
      results.push(helpers.makeLegislatorFormElements(val, bioguideId));
      return results;
    }, []);

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


  it('should make a POTC message from a Message model', function() {

    var robertsMessage = new Message({
      'bioguideId': 'R000307',
      'topic': null,
      'subject': 'Test',
      'message': 'Dear Sen Roberts, \ttest',
      'sender': {
        'namePrefix': 'Ms',
        'firstName': 'First',
        'lastName': 'Last',
        'email': 'test@test.com',
        'phone': '111-111-111',
        'parenPhone': '(111) 111-1111'
      },
      'canonicalAddress': {
        'inputIndex': 0,
        'address': '10 N Test St, Wichita KS 11111-1111',
        'county': 'Sedgwick',
        'longitude': -97.30465,
        'latitude': 37.71053,
        'components': {
          'primaryNumber': '10',
          'streetName': 'Test',
          'streetPredirection': 'N',
          'streetSuffix': 'St',
          'cityName': 'Wichita',
          'stateAbbreviation': 'KS',
          'stateName': 'Kansas',
          'zipcode': '11111',
          'plus4Code': '1111'
        }
      },
      'campaign': {
        'uuid': '',
        'orgURL': '',
        'orgName': ''
      }
    });

    var robertsPotcMessage = helpers.makePOTCMessage(robertsMessage, 'test');

    expect(robertsPotcMessage)
      .to.deep.equal({
        'bio_id': 'R000307',
        'fields': {
          '$NAME_PREFIX': 'Ms',
          '$NAME_FIRST': 'First',
          '$NAME_LAST': 'Last',
          '$NAME_FULL': 'First Last',
          '$ADDRESS_STREET': '10 N Test St',
          '$ADDRESS_STREET_2': null,
          '$ADDRESS_CITY': 'Wichita',
          '$ADDRESS_STATE_POSTAL_ABBREV': 'KS',
          '$ADDRESS_STATE_FULL': 'Kansas',
          '$ADDRESS_COUNTY': undefined,
          '$ADDRESS_ZIP5': '11111',
          '$ADDRESS_ZIP4': '1111',
          '$ADDRESS_ZIP_PLUS_4': '11111-1111',
          '$PHONE': '111-111-111',
          '$PHONE_PARENTHESES': '(111) 111-1111',
          '$EMAIL': 'test@test.com',
          '$TOPIC': null,
          '$SUBJECT': 'Test',
          '$MESSAGE': 'Dear Sen Roberts, \ttest',
          '$CAMPAIGN_UUID': '',
          '$ORG_URL': '',
          '$ORG_NAME': ''
        },
        'campaign_tag': 'test'
      });


    var vitterMessage = new Message({
      bioguideId: 'V000127',
      topic: 'Agriculture',
      subject: 'Test',
      message: 'Dear Sen Vitter, \nTest',
      sender: {
        namePrefix: 'Ms',
        firstName: 'First',
        lastName: 'Last',
        email: 'test@test.com',
        phone: '111-111-111',
        parenPhone: '(111) 111-1111',
        county: 'Orleans Parish'
      },
      canonicalAddress: {
        inputIndex: 0,
        address: '4774 Test Ave, New Orleans LA 11111-1111',
        county: 'Orleans',
        longitude: -90.07447,
        latitude: 30.00592,
        components: {
          primaryNumber: '4774',
          streetName: 'Test',
          streetSuffix: 'Ave',
          cityName: 'New Orleans',
          stateAbbreviation: 'LA',
          stateName: 'Louisiana',
          zipcode: '11111',
          plus4Code: '1111'
        }
      },
      campaign: {
        uuid: '',
        orgURL: '',
        orgName: ''
      }
    });

    var vitterPotcMessage = helpers.makePOTCMessage(vitterMessage, 'test');

    expect(vitterPotcMessage)
      .to.deep.equal({
        bio_id: 'V000127',
        fields: {
          '$NAME_PREFIX': 'Ms',
          '$NAME_FIRST': 'First',
          '$NAME_LAST': 'Last',
          '$NAME_FULL': 'First Last',
          '$ADDRESS_STREET': '4774 Test Ave',
          '$ADDRESS_STREET_2': null,
          '$ADDRESS_CITY': 'New Orleans',
          '$ADDRESS_STATE_POSTAL_ABBREV': 'LA',
          '$ADDRESS_STATE_FULL': 'Louisiana',
          '$ADDRESS_COUNTY': 'Orleans Parish',
          '$ADDRESS_ZIP5': '11111',
          '$ADDRESS_ZIP4': '1111',
          '$ADDRESS_ZIP_PLUS_4': '11111-1111',
          '$PHONE': '111-111-111',
          '$PHONE_PARENTHESES': '(111) 111-1111',
          '$EMAIL': 'test@test.com',
          '$TOPIC': 'Agriculture',
          '$SUBJECT': 'Test',
          '$MESSAGE': 'Dear Sen Vitter, \nTest',
          '$CAMPAIGN_UUID': '',
          '$ORG_URL': '',
          '$ORG_NAME': ''
        },
        campaign_tag: 'test'
      });

  });

});