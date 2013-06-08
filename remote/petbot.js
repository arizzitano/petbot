var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var __dirname = './public';

var urlconf = {
	'/': '/index.html'
};

app.listen(process.env.PORT || 5000);

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

io.sockets.on('connection', function (socket) {
	console.log('connection established');
	socket.on('direction', function (data) {
		console.log('broadcasting: '+data);
		socket.broadcast.emit('direction', data);
	});
});
