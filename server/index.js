var express = require('express');
var util = require('util');

var Game = require('./Game');

var app = express();
app.use(function (req, res, next) {
	console.log(req.method, req.url);
	next();
});
app.use(express.static('build'));

var http = require('http').Server(app);
var io = require('socket.io')(http);


// io.use((socket, next) => {
// 	console.log('MIDDLEWARE FTW:', socket.id);
// 	next();
// });


var game1 = new Game(io.of('/game1'));

setInterval(() => console.log(util.inspect(game1)), 20000);

var server = http.listen(7777, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('###################################');
	console.log(`Triviarator running on port ${port}`);
	console.log('Open browser to ');
	console.log(`    - http://localhost:${port}/#team`);
	console.log(`    - http://localhost:${port}/#host`);
	console.log(`    - http://localhost:${port}/#board`);
	console.log('###################################');
});