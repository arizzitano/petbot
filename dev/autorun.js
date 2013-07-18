#!/usr/bin/env node

process.title = 'petbot_autorun';

var watch = require('node-watch');
var _ = require('underscore')._;
require('./utils.js');
var config = require('../common/config');
var client = require('socket.io-client');

var WEB_PORT = 5000;

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
      info('Local: Starting...');
      var mode = 'raspi';
      if (mode === 'mock') {
        var env = { LOCAL_SERVER: mode };
        var cmd = [
          'killall --quiet -SIGHUP --user ' + process.env.USER + ' petbot_local',
          'sleep 0.5', // wait for the petbot process to shut down gracefully
          'node localserver'
        ].join(';');
        exec('sh', ['-c', cmd], { cwd: 'local/', pipe: true, name: 'local', env: env }, function (err) {
          info('Local: Exited.');
        });
      } else {
        var remoteCmd = [
          'killall --quiet -SIGHUP petbot_local',
          'sleep 0.5', // wait for the petbot process to shut down gracefully
          'cd petbot_rsync/local/',
          'LOCAL_SERVER=' + mode + ' node localserver'
        ].join(';');
        var cmd = [
          'echo Syncing to Raspberry Pi...',
          'rsync --recursive --quiet local/ pi@raspberrypi.local:~/petbot_rsync/local/',
          'echo Finished syncing to Raspberry Pi.',
          'ssh pi@raspberrypi.local "' + remoteCmd + '"'
        ].join(';');
        exec('sh', ['-c', cmd], { cwd: './', pipe: true, name: 'local' }, function (err) {
          info('Local: Exited.');
        });
      }
    },
    execOnStart: 500
  },
  {
    name: 'reset remote',
    watch: /^remote\//,
    exec: function () {
      info('Remote: Starting...');
      var env = { PORT: WEB_PORT };
      var cmd = [
        'killall --quiet -SIGHUP --user ' + process.env.USER + ' petbot',
        'sleep 0.5', // wait for the petbot process to shut down gracefully
        'node petbot'
      ].join(';');
      exec('sh', ['-c', cmd], { cwd: 'remote/', pipe: true, name: 'remote', env: env }, function (err) {
        info('Remote: Exited.');
      });
    },
    execOnStart: true
  },
  {
    name: 'reload ui',
    watch: /^public\//,
    exec: function () {
      info('sending reload command to ' + config.HOST);
      var socket = client.connect('http://localhost:5000/', {
        'force new connection': true,
        transports: ['xhr-polling']
      });
      socket.emit('reloadui');
      // Don't leave this connection hanging around
      setTimeout(function () {
        socket.disconnect();
      }, 10000);
    },
    debounceDelay: 100
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
      }, opts.debounceDelay || 500);
      return true;
    }
    return false;
  };
  if (opts.execOnStart) {
    setTimeout(function () {
      opts.exec();
    }, typeof opts.execOnStart === 'number' ? opts.execOnStart : 0);
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
