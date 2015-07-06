/**
 * Top level server.
 * @type {exports}
 */

var app = require('./server/app');

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening on http://%s:%s', host, port);
});

module.exports = server;