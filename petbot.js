var arduino = require('duino');
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var __static = './public';
var pinMap = {
	'forward': '02',
	'back': '03',
	'left': '04',
	'right': '05'
};

var board = new arduino.Board({
  debug: true
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

*/
app.listen(8080);

function handler (req, res) {
  fs.readFile(__static + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
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
    //board.digitalWrite('09', board.HIGH);
  });
});
