var LocalServer = require('./localserver');
var RasPiServer = function () {
    this.pinMap = {
        'forward': {
            pin: 7,
            open: false
        },
        'back': {
            pin: 11,
            open: false
        },
        'left': {
            pin: 16,
            open: false
        },
        'right': {
            pin: 15,
            open: false
        }
    };
};
RasPiServer.prototype = new LocalServer();
RasPiServer.prototype.constructor = RasPiServer;

/**
 * open up all the relevant gpio pins (needs improvement)
 **/
RasPiServer.prototype.wake = function () {
    var self = this;
    _.each(self.pinMap, function (k, v) {
        try {
			gpio.open(v.pin, 'output');
		} catch (err) {
			console.log(err);
			v.open = true;
		}
    });
};

/**
 * close all the relevant gpio pins (needs improvement)
 **/
RasPiServer.prototype.sleep = function () {
    var self = this;
    _.each(self.pinMap, function (k, v) {
        try {
			gpio.close(v.pin, 'output');
		} catch (err) {
			console.log(err);
			v.open = false;
		}
    });
};

RasPiServer.prototype.write = function (direction, level) {
    var self = this;
    if (self.pinMap[direction].open) {
        gpio.write(self.pinMap[direction].pin, level);
    }
};
