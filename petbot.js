var arduino = require('duino');
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var __dirname = './public';
var pinMap = {
	'forward': '02',
	'back': '03',
	'left': '04',
	'right': '05'
};
var urlconf = {
	'/': '/index.html'
};

var board = new arduino.Board({
  debug: true
});

app.listen(8080);

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

function handleSignal(direction, active) {
	console.log(direction + ' ' + active);
	var level = (active) ? board.HIGH : board.LOW;
	board.digitalWrite(pinMap[direction], level);
}

io.sockets.on('connection', function (socket) {
	console.log('working');
	socket.on('direction', function (data) {
    	handleSignal(data.name, data.active);
	});
});
