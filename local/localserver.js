var config = require('../common/config');
var client = require('socket.io-client');
var _ = require('underscore');

var LocalServer = function () {
    this.socket = client.connect(config.HOST);
    this.BOARD_LOW = 0;
    this.BOARD_HIGH = 1;
    this.pinMap = {};
};

LocalServer.prototype.handleSignal = function (data) {
    var self = this;
    if (data.name == 'killswitch') {
        self.kill();
    } else {
        var level = (data.active) ? self.BOARD_HIGH : self.BOARD_LOW;
        self.write(data.name, level);
    }
}

LocalServer.prototype.sleep = function () {
    console.log('local server is idle');
}

LocalServer.prototype.wake = function () {
    console.log('local server is awake');
}

LocalServer.prototype.write = function (direction, level) {
    console.log('direction ' + direction + ' at level ' + level);
}

LocalServer.prototype.kill = function () {
    var self = this;
	console.log('KILLSWITCH ENGAGE');
	_.each(pinMap, function (k, v) {
	    self.write(v.pin, self.BOARD_LOW)
	});
}

LocalServer.prototype.run = function () {
    var self = this;
    self.socket.on('connect', function() {
        console.log('connected to remote server');
        self.socket.emit('clientId', {id: config.DEVICE_ID});

        self.wake();

        self.socket.on('direction', function(data) {
            self.handleSignal(data);
        });

        self.socket.on('disconnect', function() {
            console.log('disconnected from remote server');
            self.sleep();
        });
    });
};

module.exports = LocalServer;
