process.title = 'petbot';

var config = require('../common/config');
var express = require('express');
var app = express();
var socket = require('socket.io');
var _ = require('underscore');
var queue = [];
var localServerUp = null;

var T = require('tbone').tbone;
var tbone = T;

var browsers = tbone.collections.base.make({
    lookupById: true
});
T('browsers', browsers);
T('drive', function () {
    var driving = _.filter(_.pluck(T('browsers') || {}, 'drive'), function (drive) {
        return drive && (!!drive.right || !!drive.forward);
    });
    return driving.length === 0 ? {} : driving[0];
});
T('isDriving', function () {
    return !!T('drive.forward') || !!T('drive.right');
});
T('botOnline', function () {
    return _.keys(T('bots')).length > 0;
});

var bots = tbone.collections.base.make({
    lookupById: true
});
T('bots', bots);

app.configure(function () {
    var username = process.env.AUTH_USERNAME;
    var password = process.env.AUTH_PASSWORD;
    if (username != null && password != null) {
        app.use(express.basicAuth(username, password));
    }
    app.use(express.static(__dirname + '/../public'));
});

var server = app.listen(process.env.PORT || 5000);

// Gracefully shutdown (preferably releasing port immediately) on SIGHUP
process.on('SIGHUP', function () {
  try {
    server.close(function() {
      process.exit(0);
    });
  } catch(e) {
    process.exit(0);
  }
});

var io = socket.listen(server);

io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set("log level", 1);
    io.set('heartbeat interval', 12);
    io.set('heartbeat timeout', 20);
});

io.sockets.on('connection', function (socket) {
    var address = socket.handshake.address;
    console.log('new connection ' + socket.id + ' from ' + address.address + ":" + address.port);
    socket.on('clientId', function (data) {
        if (data.id === config.DEVICE_ID) {
            handleLocalServer(socket);
        } else {
            handleBrowser(socket);
        }
    });
    if (address.address.match(/^127.0.0.1/)) {
        socket.on('reloadui', function () {
            console.log('broadcasting UI reload');
            io.sockets.emit('reloadui');
        });
    }
});

var nextId = 1;
var handleLocalServer = function (socket) {
    console.log('local server is connected');
    var me = tbone.make();
    var myId = nextId++;
    socket.emit('yourId', myId);
    me.query('id', myId);
    bots.add(me);
    T(function () {
        if (!socket.disconnected) {
            socket.emit('drive', T('drive'));
        }
    });
    T(function () {
        if (!socket.disconnected) {
            if (T('isDriving')) {
                socket.emit('keepDriving');
                T('isDrivingTimer');
                setTimeout(function () {
                    T.toggle('isDrivingTimer');
                }, 500);
            }
        }
    });
    socket.on('pins', function (data) {
        me('pins', data);
    });
    socket.on('drive', function (data) {
        me('drive', data);
    });
    socket.on('disconnect', function () {
        bots.remove(me);
        console.log('local server disconnected');
    });
};

function handleBrowser (socket) {
    var me = tbone.make();
    var myId = nextId++;
    socket.emit('yourId', myId);
    me.query('id', myId);
    browsers.add(me);
    T(function () {
        if (!socket.disconnected) {
            socket.emit('browsers', T('browsers'));
        }
    });
    T(function () {
        if (!socket.disconnected) {
            socket.emit('bots', T('bots'));
        }
    });
    T(function () {
        if (!socket.disconnected) {
            socket.emit('drive', T('drive'));
        }
    });
    T(function () {
        if (!socket.disconnected) {
            socket.emit('botOnline', !!T('botOnline'));
        }
    });
    // Expect the client to say "keepDriving" every ~500 ms.
    var driveTimeout;
    function stopDrivingAfterTimeout() {
        if (driveTimeout) {
            clearTimeout(driveTimeout);
        }
        driveTimeout = setTimeout(function () {
            me.query('drive', {});
        }, 1000);
    }
    socket.on('drive', function (data) {
        me.query('drive', _.extend(data, { browserId: myId }));
        stopDrivingAfterTimeout();
    });
    socket.on('keepDriving', function () {
        stopDrivingAfterTimeout();
    });
    socket.on('disconnect', function () {
        browsers.remove(me);
    });
}
