process.title = 'petbot_local';

var config = require('../common/config');
var client = require('socket.io-client');
var _ = require('underscore');

var T = require('tbone').tbone;
var tbone = T;

var servers = tbone.collections.base.make({
    lookupById: true
});

var localServer = tbone.make();
T('servers', servers);

localServer('drive', function () {
    var driving = _.filter(_.pluck(T('servers') || {}, 'drive'), function (drive) {
        return drive && (!!drive.right || !!drive.forward);
    });
    return driving.length === 0 ? {} : driving[0];
});
localServer('awake', function () {
    return _.keys(T('servers')).length > 0;
});

var nextId = 1;
var socket = client.connect(config.HOST, { transports: ['xhr-polling'] });
socket.on('connect', function() {
    var me = tbone.make();
    me('id', nextId++);
    servers.add(me);

    console.log('connected to remote server');
    socket.emit('clientId', {id: config.DEVICE_ID});

    // Expect the server to say "keepDriving" every ~500 ms.
    var driveTimeout;
    function stopDrivingAfterTimeout() {
        if (driveTimeout) {
            clearTimeout(driveTimeout);
        }
        driveTimeout = setTimeout(function () {
            me('drive', {});
        }, 1000);
    }
    socket.on('drive', function(data) {
        me('drive', data);
        stopDrivingAfterTimeout();
    });
    socket.on('keepDriving', function () {
        stopDrivingAfterTimeout();
    });
    T(function () {
        if (!socket.disconnected) {
            socket.emit('pins', localServer('pins'));
        }
    });
    T(function () {
        if (!socket.disconnected) {
            socket.emit('drive', localServer('drive'));
        }
    });

    socket.on('disconnect', function() {
        console.log('disconnected from remote server');
        servers.remove(me);
    });
});

require('./' + process.env.LOCAL_SERVER + '.js')(localServer);

// Gracefully shutdown on SIGHUP
process.on('SIGHUP', function () {
    try {
        socket.disconnect(function() {
            process.exit(0);
        });
    } catch(e) {
        process.exit(0);
    }
});
