/**
 * Routes for the API endpoints.
 */

var apiViews = require('../views/api');


module.exports = [

  [
    {
      path: '/api/1/representatives',
      name: 'api/1/getRepresentatives'
    },
    {
      get: apiViews.getRepresentatives
    }
  ]

];
