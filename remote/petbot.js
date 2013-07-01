process.title = 'petbot';

var config = require('../common/config');
var express = require('express');
var app = express();
var socket = require('socket.io');
var _ = require('underscore');
var queue = [];
var localServerUp = null;

var T = require('./tbone.js').tbone;
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

var handleLocalServer = function (socket) {
    console.log('local server is connected');
    localServerUp = true;
    broadcastLocalStatus(localServerUp, socket);
    socket.on('disconnect', function () {
        console.log('local server disconnected');
        localServerUp = false;
        broadcastLocalStatus(localServerUp, socket);
    });
};

var nextBrowserId = 1;
function handleBrowser (socket) {
    var me = tbone.models.base.make();
    var myId = nextBrowserId++;
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
            socket.emit('drive', T('drive'));
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

var broadcastLocalStatus = function (isUp, socket) {
    var statusObj = {};
    if (isUp === true) {
        statusObj = {
            online: true,
            status: 'online',
            message: 'PETBOT is online and ready to go!'
        };
    } else if (isUp === false) {
        statusObj = {
            online: false,
            status: 'offline',
            message: 'PETBOT is offline'
        };
    } else {
        statusObj = {
            online: false,
            status: 'connecting',
            message: 'Attempting to connect to PETBOT...'
        };
    }
    socket.broadcast.emit('localStatus', statusObj);
};

// fire when a new connection moves into the #0 spot
var openCurrentSocket = function (member) {
    console.log('now listening to connection '+member.id);
    broadcastLocalStatus(localServerUp, member.socket);
    member.socket.on('direction', function (data) {
        console.log('broadcasting: '+data);
        member.socket.broadcast.emit('direction', data);
    });
    member.socket.on('disconnect', function () {
        console.log('connection ' + member.id + ' is disconnecting');
        // remove this connection from the queue
        updateQueue(member, false);
    });
};

// handle changes in the queue. add or remove, then start listening to a new connection
// if necessary.
var updateQueue = function (member, shouldAdd) {
    var firstItemId = (queue.length > 0) ? queue[0].id : null;
    if (shouldAdd) {
        queue.push(member);
    } else {
        queue = _.reject(queue, function(item) {
            return item.id === member.id;
        });
    }
    // XXX possible race condition?
    // if guid of first item has changed, there's a new connection in first place
    if (queue.length > 0 && firstItemId !== queue[0].id) {
        openCurrentSocket(queue[0]);
    }
};
