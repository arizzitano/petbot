var arduino = require('duino');
var client = require('socket.io-client');
var socket = client.connect('http://petbot.herokuapp.com');
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

socket.on('connect', function(){
	console.log('connected to remote server');
	socket.on('direction', function(data) {
		handleSignal(data.name, data.active);
	});
	socket.on('disconnect', function() {
		console.log('disconnected from remote server');
	});
});
