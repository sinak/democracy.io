angular.module('democracyFilters', []).filter('trusted_html', function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
});
