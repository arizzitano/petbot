var arduino = require('duino');
var client = require('socket.io-client');
var socket = client.connect('http://petbot.herokuapp.com');
//var socket = client.connect('http://localhost:5000');
var board = new arduino.Board({
	debug: true
});
var pinMap = {
	'forward': '02',
	'back': '03',
	'left': '04',
	'right': '05'
};

function handleSignal(direction, active) {
	console.log('arduino: ' + direction + ' ' + active);
	var level = (active) ? board.HIGH : board.LOW;
	board.digitalWrite(pinMap[direction], level);
}

function kill() {
	console.log('KILLSWITCH ENGAGE');
	board.digitalWrite('02', board.LOW);
	board.digitalWrite('03', board.LOW);
	board.digitalWrite('04', board.LOW);
	board.digitalWrite('05', board.LOW);
}

socket.on('connect', function(){
	console.log('connected to remote server');
	socket.on('direction', function(data) {
		if (data.name == 'killswitch') {
			kill();
		} else {
			handleSignal(data.name, data.active);
		}
	});
	socket.on('disconnect', function() {
		console.log('disconnected from remote server');
	});
});
