/**
 * Tests for the page location helpers.
 */

var expect = require('chai').expect;
var nestedDescribe = require('nested-describe');

var pageLocation = require('../../../www/js/helpers/page-location');


nestedDescribe('www.helpers.page-location', function() {

  it('should get page state', function() {
    // New visit, starting at home
    var newState = pageLocation.getPageState('/', undefined, undefined);
    expect(newState)
      .to.be.deep.equal({pageFrom: 'new-visit', pageName: 'home'});

    // Existing visit, starting on rep picker page
    var repPickerPageState = pageLocation.getPageState('/location', 'home', {});
    expect(repPickerPageState)
      .to.be.deep.equal({pageFrom: 'home', pageName: 'location'});

    // Existing visit, going back to the home page
    repPickerPageState = pageLocation.getPageState('/', 'location', {});
    expect(repPickerPageState)
      .to.be.deep.equal({pageFrom: 'location', pageName: 'home'});
  });

});
