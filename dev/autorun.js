#!/usr/bin/env node

var watch = require('node-watch');
var _ = require('underscore')._;

var tasks = [
  {
    name: 'resetself',
    watch: /^dev\//,
    exec: function() {
      console.log('Restarting autorun.js...');
      _.defer(function() {
        process.exit(0);
      });
    },
    execInterval: 1000,
    execOnStart: false
  }
];

_.each(tasks, function(opts) {
  var _exec = opts.exec;
  var timeout;
  opts.exec = function() {
    if (!timeout) {
      timeout = setTimeout(function() {
        timeout = null;
        _exec();
      }, opts.execInterval);
      return true;
    }
    return false;
  };
  if (opts.execOnStart !== false) {
    opts.exec();
  }
});

watch('./', function (filename) {
  var tasksToExec = _.filter(tasks, function(opts) {
    return filename.match(opts.watch) && (!opts.ignore || !filename.match(opts.ignore));
  });
  var tasksQueued = _.filter(tasksToExec, function(opts) {
    return opts.exec();
  });
  if (tasksQueued.length) {
    console.log('executed [' + _.pluck(tasksQueued, 'name').join(', ') + '] due to change of [' + filename + ']');
  }
});

console.log('autorun.js started.');
