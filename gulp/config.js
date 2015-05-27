var path = require('path');

module.exports = {
  BUILD_DIR: path.join(__dirname, '../.build'),
  NPM_DIR: path.join(__dirname, '../node_modules'),
  STATIC_DIR: path.join(__dirname, '../.build/static'),
  SERVER_DIR: path.join(__dirname, '../server'),
  TEST_DIR: path.join(__dirname, '../test'),
  WWW_DIR: path.join(__dirname, '../www')
};
