#!/usr/bin/env node

process.title = 'petbot_autorun';

var watch = require('node-watch');
var _ = require('underscore')._;
require('./utils.js');

var tasks = [
  {
    name: 'resetself',
    watch: /^dev\//,
    exec: function() {
      info('Restarting autorun.js...');
      _.defer(function() {
        process.exit(0);
      });
    }
  },
  {
    name: 'reset local',
    watch: /^local\//,
    exec: function () {
      info('Local: Starting...')
      exec('node', ['arduino.js'], { cwd: './local', pipe: true, name: 'local' }, function (err) {
        info('Local: Exited.');
      });
    },
    execOnStart: true
  },
  {
    name: 'reset remote',
    watch: /^remote\//,
    exec: function () {
      info('Remote: Starting...')
      exec('node', ['petbot.js'], { cwd: './remote', pipe: true, name: 'remote' }, function (err) {
        info('Remote: Exited.');
      });
    },
    execOnStart: true
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
      }, opts.execInterval || 1000);
      return true;
    }
    return false;
  };
  if (opts.execOnStart) {
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
    info('executed [' + _.pluck(tasksQueued, 'name').join(', ') + '] due to change of [' + filename + ']');
  }
});

info('autorun.js started.');
