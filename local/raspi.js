var config = require('../common/config');
var gpio = require('pi-gpio');
var client = require('socket.io-client');
var socket = client.connect('http://petbot.herokuapp.com');
//var socket = client.connect('http://localhost:5000');
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
		pin: 16,
		open: false
	},
	'right': {
		pin: 15,
		open: false
	}
};

function handleSignal(direction, active) {
	console.log('pi: ' + direction + ' ' + active);
	var level = (active) ? 1 : 0;
	if (!pinMap[direction].open) {
		gpio.open(pinMap[direction].pin, 'output', function(err) { console.log(err); });
		pinMap[direction].open = true;
	}
	gpio.write(pinMap[direction].pin, level);
}

function kill() {
	console.log('KILLSWITCH ENGAGE');
	for (var i=0; i<pinMap.length; i++) {
		gpio.write(pinMap[i], 0);
	}
}

socket.on('connect', function(){
	console.log('connected to remote server');
	socket.emit('clientId', {id: config.DEVICE_ID});
	for (var i=0; i<pinMap.length; i++) {
		try {
			gpio.open(pinMap[i].pin, 'output');
		} catch (err) {
			console.log(err);
			pinMap[i].open = true;
		}
	}

	socket.on('direction', function(data) {
		if (data.name == 'killswitch') {
			kill();
		} else {
			handleSignal(data.name, data.active);
		}
	});

	socket.on('disconnect', function() {
		console.log('disconnected from remote server');
		for (var i=0; i<pinMap.length; i++) {
			gpio.close(pinMap[i].pin, function(err) { console.log(err); });
		}
	});
});
