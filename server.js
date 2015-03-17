/**
 * Top level server.
 * @type {exports}
 */

var http = require('http');

var app = require('./server/index');

var server;

server = http.createServer(app);
server.listen(process.env.PORT || 3000);
server.on('listening', function () {
  console.log('Server listening on http://localhost:%d', this.address().port);
});

module.exports = server;