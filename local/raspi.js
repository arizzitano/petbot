// var LocalServer = require('./localserver');
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
// RasPiServer.prototype = new LocalServer();
// RasPiServer.prototype.constructor = RasPiServer;

// /**
//  * open up all the relevant gpio pins (needs improvement)
//  **/
// RasPiServer.prototype.wake = function () {
//     var self = this;
//     _.each(self.pinMap, function (k, v) {
//         try {
// 			gpio.open(v.pin, 'output');
// 		} catch (err) {
// 			console.log(err);
// 			v.open = true;
// 		}
//     });
// };

// /**
//  * close all the relevant gpio pins (needs improvement)
//  **/
// RasPiServer.prototype.sleep = function () {
//     var self = this;
//     _.each(self.pinMap, function (k, v) {
//         try {
// 			gpio.close(v.pin, 'output');
// 		} catch (err) {
// 			console.log(err);
// 			v.open = false;
// 		}
//     });
// };

var gpio = require('pi-gpio');

var ON = 1; // XXX ?
var OFF = 0;

function write (direction, level) {
    var self = this;
    if (self.pinMap[direction].open) {
        gpio.write(self.pinMap[direction].pin, level);
    }
}

var T = require('tbone').tbone;
var tbone = T;

module.exports = function (me) {
    var lastDriveRight = 0;
    var lastDriveForward = 0;
    var lastLightOn = false;
    T(function () {
        var drive = me('drive');
        if (drive.right !== lastDriveRight) {
            if (lastDriveRight === 1) {
                write('right', OFF);
            }
            if (drive.right === 1) {
                write('right', ON);
            }
            if (lastDriveRight === -1) {
                write('left', OFF);
            }
            if (drive.right === -1) {
                write('left', ON);
            }
            lastDriveRight = drive.right
        }
        if (drive.forward !== lastDriveForward) {
            if (lastDriveForward === 1) {
                write('forward', OFF);
            }
            if (drive.forward === 1) {
                write('forward', ON);
            }
            if (lastDriveForward === -1) {
                write('back', OFF);
            }
            if (drive.forward === -1) {
                write('back', ON);
            }
            lastDriveForward = drive.forward;
        }

        var lightOn = drive.right !== 0 || drive.forward !== 0;
        if (lightOn !== lastLightOn) {
            if (lightOn) {
                // write('light', ON);
            } else {
                // write('light', OFF);
            }
            lastLightOn = ligthOn;
        }

        me('pins.right', drive.right === 1 ? 5 : 0);
        me('pins.left', drive.right === -1 ? 5 : 0);
        me('pins.forward', drive.forward === 1 ? 5 : 0);
        me('pins.backward', drive.forward === -1 ? 5 : 0);
    });

    T(function () {
        var awake = !!me('awake');
        me('pins.ready', awake);
    });
};
