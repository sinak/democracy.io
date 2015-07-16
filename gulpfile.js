/**
 * Top level gulpfile - it imports all tasks defined under gulp/tasks
 */

// Force the env into test mode for the gulp test task prior to importing any tasks. This is to
// ensure that
var argv = process.argv;
if (argv[argv.length - 1] === 'test') {
  process.env.NODE_ENV = 'test';
}

var requireDir = require('require-dir');

requireDir('./gulp/tasks', {recurse: true});

