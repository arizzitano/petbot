var express = require('express');
var app = express();
var socket = require('socket.io');

app.configure(function () {
	app.use(express.static(__dirname + '/../public'));
	
	var username = process.env.AUTH_USERNAME;
	var password = process.env.AUTH_PASSWORD;
	//if (process.env != null) {
		app.use(express.basicAuth(username, password));
	//}
});

var server = app.listen(process.env.PORT || 5000);

var io = socket.listen(server);

io.configure(function () {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) {
	console.log('connection established');
	socket.on('direction', function (data) {
		console.log('broadcasting: '+data);
		socket.broadcast.emit('direction', data);
	});
});
