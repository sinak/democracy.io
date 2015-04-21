/**
 * Data storage layer for working with app data.
 *
 * The data stored by the app (backed by session cookies) is:
 *   a. CanonicalAddress
 *   b. Legislators
 *   c. SelectedLegislators
 *   d. FormElements (TBD)
 */

var filter = require('lodash.filter');
var forEach = require('lodash.forEach');
var isArray = require('lodash.isArray');
var isEmpty = require('lodash.isEmpty');
var map = require('lodash.map');
var partial = require('lodash.partial');
var zipObject = require('lodash.zipObject');

var models = require('../../../models');

var legislatorData = function($sessionStorage) {

  $sessionStorage.$default({
    LEGISLATORS: [],
    BIOGUIDE_IDS_BY_SELECTION: {},
    CANONICAL_ADDRESS: new models.CanonicalAddress(),
    LEGISLATOR_FORM_ELEMENTS: []
  });

  var getValue = function(key, model) {
    try {
      var rawObj = $sessionStorage[key];
      if (model === undefined) {
        return rawObj;
      } else {
        if (isArray(rawObj)) {
          return map(rawObj, function(childObj) {
            return new model(childObj);
          });
        } else {
          return new model(rawObj)
        }
      }
    } catch(e) {
      return undefined;
    }
  };

  var setValue = function(key, val) {
    $sessionStorage[key] = val;
  };

  var hasValue = function(key) {
    // NOTE: this uses isEmpty, which is going to check collections etc correctly, but won't
    //       deal with numbers, e.g. isEmpty([]) == true, isEmpty(12) == true
    return !isEmpty(getValue(key));
  };

  var removeValue = function(key) {
    delete $sessionStorage[key];
  };

  var api = {

    clearData: function() {
      $sessionStorage.$reset();
    },

    setLegislators: function(legislators) {
      setValue('LEGISLATORS', legislators);

      var selectedLegislators = zipObject(map(legislators, function(legislator) {
        return [legislator.bioguideId, true];
      }));

      setValue('BIOGUIDE_IDS_BY_SELECTION', selectedLegislators);
    },

    getSelectedLegislators: function() {
      var bioguideIdsBySelection = getValue('BIOGUIDE_IDS_BY_SELECTION');
      return filter(this.getLegislators(), function(legislator) {
        return bioguideIdsBySelection[legislator.bioguideId];
      }, this);
    }

  };

  // Add setter / getter functions to serialize the models
  var objectKeys = [
    {name: 'CanonicalAddress', model: models.CanonicalAddress, key: 'CANONICAL_ADDRESS'},
    {name: 'Legislators', model: models.Legislator, key: 'LEGISLATORS'},
    {name: 'LegislatorsFormElements', model: models.LegislatorFormElements, key: 'LEGISLATOR_FORM_ELEMENTS'},
    {name: 'BioguideIdsBySelection', key: 'BIOGUIDE_IDS_BY_SELECTION'}
  ];

  forEach(objectKeys, function(obj) {
    api['get' + obj.name] = api['get' + obj.name] || partial(getValue, obj.key, obj.model);
    api['set' + obj.name] = api['set' + obj.name] || partial(setValue, obj.key);
    api['has' + obj.name] = api['has' + obj.name] || partial(hasValue, obj.key);
    api['remove' + obj.name] = api['remove' + obj.name] || partial(removeValue, obj.key);
  });

  return api;
};

module.exports = legislatorData;
