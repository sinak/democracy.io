/**
 *
 * @param options
 * @constructor
 */

var isEmpty = require('lodash.isempty');


function AddressSuggestion(options) {
  options = isEmpty(options) ? {} : options;
    
  this.text = options.text;
  this.streetLine = options.streetLine;
  this.city = options.city;
  this.state = options.state;
}

module.exports = AddressSuggestion;
