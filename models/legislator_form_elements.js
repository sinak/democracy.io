/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');
var map = require('lodash.map');

var FormElement = require('./form_element');


var LegislatorFormElements = function(options) {
  options = isEmpty(options) ? {} : options;
    
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


module.exports = LegislatorFormElements;
