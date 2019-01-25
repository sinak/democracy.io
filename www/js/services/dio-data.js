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
var forEach = require('lodash.foreach');
var isArray = require('lodash.isarray');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var keys = require('lodash.keys');
var map = require('lodash.map');
var partial = require('lodash.partial');
var pick = require('lodash.pick');
var zipObject = require('lodash.zipobject');

var models = require('../../../models');

var legislatorData = function(locker) {

  var DATA_KEYS = {
    CA: 'CANONICAL_ADDRESS',
    L: 'LEGISLATORS',
    LFE: 'LEGISLATOR_FORM_ELEMENTS',
    BIBS: 'BIOGUIDE_IDS_BY_SELECTION',
    MR: 'MESSAGE_RESPONSES'
  };

  var DEFAULT_VALUES = {};
  DEFAULT_VALUES[DATA_KEYS.CA] = null;
  DEFAULT_VALUES[DATA_KEYS.L] = [];
  DEFAULT_VALUES[DATA_KEYS.LFE] = [];
  DEFAULT_VALUES[DATA_KEYS.BIBS] = {};

  var getValue = function(key, model) {
    try {
      var rawObj = locker.get(key, DEFAULT_VALUES[key]);
      if (isEmpty(rawObj)) {
        return undefined;
      }

      if (isUndefined(model)) {
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
    locker.put(key, val);
  };

  var hasValue = function(key) {
    return locker.has(key);
  };

  var removeValue = function(key) {
    locker.forget(key);
  };

  var api = {

    clearData: function() {
      locker.clean();
    },

    setLegislators: function(legislators) {
      setValue(DATA_KEYS.L, legislators);

      var selectedLegislators = zipObject(map(legislators, function(legislator) {
        var selectedStatus = true;
        if (legislator.defunct === true) { selectedStatus = false; }
        if (legislator.comingSoon === true) { selectedStatus = false; }
        return [legislator.bioguideId, selectedStatus];
      }));

      setValue(DATA_KEYS.BIBS, selectedLegislators);
    },

    getSelectedLegislators: function() {
      var bioguideIdsBySelection = getValue('BIOGUIDE_IDS_BY_SELECTION');
      return filter(this.getLegislators(), function(legislator) {
        return bioguideIdsBySelection[legislator.bioguideId];
      }, this);
    },

    getSelectedBioguideIds: function() {
      var bioguideIdsBySelection = getValue('BIOGUIDE_IDS_BY_SELECTION');
      return keys(pick(bioguideIdsBySelection, function(val) {
        return val;
      }));
    }

  };

  // Add setter / getter functions to serialize the models
  var objectKeys = [
    {name: 'CanonicalAddress', model: models.CanonicalAddress, key: DATA_KEYS.CA},
    {name: 'Legislators', model: models.Legislator, key: DATA_KEYS.L},
    {name: 'LegislatorsFormElements', model: models.LegislatorFormElements, key: DATA_KEYS.LFE},
    {name: 'BioguideIdsBySelection', key: DATA_KEYS.BIBS},
    {name: 'MessageResponses', model: models.MessageResponse, key: DATA_KEYS.MR}
  ];

  forEach(objectKeys, function(obj) {
    api['get' + obj.name] = api['get' + obj.name] || partial(getValue, obj.key, obj.model);
    api['set' + obj.name] = api['set' + obj.name] || partial(setValue, obj.key);
    api['has' + obj.name] = api['has' + obj.name] || partial(hasValue, obj.key);
    api['remove' + obj.name] = api['remove' + obj.name] || partial(removeValue, obj.key);
  });

  return api;
};

module.exports = ['locker', legislatorData];
