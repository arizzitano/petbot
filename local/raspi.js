var gpio = require('pi-gpio');
var _ = require('underscore');
var T = require('tbone').tbone;
var tbone = T;

var pinMap = {
    'forward': {
        pin: 7,
        open: false
    },
    'back': {
        pin: 11,
        open: false
    },
    'left': {
        pin: 12,
        open: false
    },
    'right': {
        pin: 16,
        open: false
    },
    'light': {
        pin: 15,
        open: false
    }
};
/**
 * open up all the relevant gpio pins (needs improvement)
 **/
function wake () {
    _.each(pinMap, function (v, k) {
        try {
			v.open = true;
			gpio.open(v.pin, 'output');
			console.log('opened '+v.pin);
		} catch (err) {
			console.log(err);
		}
    });
}

/**
 * close all the relevant gpio pins (needs improvement)
 **/
function sleep () {
    _.each(pinMap, function (v, k) {
        try {
            v.open = false;
			gpio.close(v.pin, 'output');
		} catch (err) {
			console.log(err);
			v.open = false;
		}
    });
}

var ON = 1; // XXX ?
var OFF = 0;

function write (direction, level) {
    console.log('pin '+pinMap[direction].pin+' is '+pinMap[direction].open);
    if (pinMap[direction].open) {
        gpio.write(pinMap[direction].pin, level);
    }
}

module.exports = function (me) {
    var lastDriveRight = 0;
    var lastDriveForward = 0;
    var lastLightOn = false;
    T(function () {
        var drive = me('drive');
        console.log(drive);
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

        var lightOn = drive.right || drive.forward;
        if (lightOn !== lastLightOn) {
            if (lightOn) {
                write('light', ON);
            } else {
                write('light', OFF);
            }
            lastLightOn = lightOn;
        }

        me('pins.right', drive.right === 1 ? 5 : 0);
        me('pins.left', drive.right === -1 ? 5 : 0);
        me('pins.forward', drive.forward === 1 ? 5 : 0);
        me('pins.backward', drive.forward === -1 ? 5 : 0);
    });

    var lastAwake = false;

    T(function () {
        var awake = !!me('awake');
        if (awake !== lastAwake) {
            if (awake) {
                wake();
            } else {
                sleep();
            }
            lastAwake = awake;
        }
        me('pins.ready', awake);
    });
};
