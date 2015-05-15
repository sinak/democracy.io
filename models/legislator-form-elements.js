/**
 *
 * @param options
 * @constructor
 */

var create = require('lodash.create');
var isEmpty = require('lodash.isempty');
var map = require('lodash.map');

var FormElement = require('./form-element');
var Model = require('./model');


var LegislatorFormElements = function(options) {
  Model.call(this, options);
};

LegislatorFormElements.prototype = create(Model.prototype, {
  'constructor': Model
});


LegislatorFormElements.prototype.setProperties = function(options) {
  this.bioguideId = options.bioguideId;

  // NOTE: this assumes that key coercion has already taken place. e.g.if using POTC data, that the POTC
  //       keys have been standardized, with maxlength ==> maxLength, options_hash ==> optionsHash etc
  if (!isEmpty(options.formElements)) {
    this.formElements = map(options.formElements, function(rawFormElem) {
      return new FormElement({
        value: rawFormElem.value,
        maxLength: rawFormElem.maxLength,
        optionsHash: rawFormElem.optionsHash
      });
    });
  } else {
    this.formElements = [];
  }
};


LegislatorFormElements.prototype.requiresCaptcha = function() {
  for (var i = 0; i < this.formElements.length; ++i) {
    if (this.formElements[i].value === '$CAPTCHA_SOLUTION') {
      return true;
    }
  }
  return false;
};


module.exports = LegislatorFormElements;
