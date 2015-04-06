/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


function CanonicalAddress(options) {
  options = isEmpty(options) ? {} : options;
    
  this.inputId = options.inputId;
  this.inputIndex = options.inputIndex;
  this.candidateIndex = options.candidateIndex;
  this.deliveryLineOne = options.deliveryLineOne;
  this.lastLine = options.lastLine;

  // TODO(leah): Update this to actually make address component objects.
  this.components = [];
  //  this.components = options.components;
}

module.exports = CanonicalAddress;
