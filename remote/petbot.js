var express = require('express');
//var http = require('http');
var app = express();
//var server = http.createServer(app);
var socket = require('socket.io');

var fs = require('fs');

var urlconf = {
	'/': '/index.html'
};

app.configure(function () {
	app.use(express.static(__dirname + '/../public'));
	
	var username = process.env.AUTH_USERNAME;
	var password = process.env.PASSWORD;
	if (username && password) {
		app.use(express.basicAuth(username, password));
	}
});

var server = app.listen(process.env.PORT || 5000);
/*
function handler (req, res) {
	var urlToServe = (urlconf[req.url] != null) ? urlconf[req.url] : req.url;
	fs.readFile(__dirname + urlToServe, function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading '+urlToServe);
		}
		res.writeHead(200);
		res.end(data);
	});
}
*/

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
