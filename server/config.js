/**
 * Server config import target, used to work around https://github.com/lorenwest/node-config/wiki/Strict-Mode
 *
 * pm2 sets a NODE_APP_INSTANCE that causes problems with config load. To workaround this,
 * move NODE_APP_INSTANCE aside during configuration loading
 */

var appInstance = process.env.NODE_APP_INSTANCE;
process.env.NODE_APP_INSTANCE = '';
var config = require('config').get('SERVER');
config.VERSION = require('../package.json').version;
process.env.NODE_APP_INSTANCE = appInstance;

module.exports = config;
