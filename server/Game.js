var uuid = require('node-uuid');
var cookie = require('cookie');

var Round = function (prevRound) {
	prevRound = prevRound || {};

	// status can be PREQUESTION, OPEN, PAUSED, OR CLOSED
	// PREQUESTION - before the question has been posted.
	// OPEN - The question has been posted and waiting for teams to buzz in
	// PAUSED - Someone has buzzed in, waiting for host to mark correct or wrong
	// CLOSED - Someone answered correctly or host moved on to new question.

	this.status = 'PREQUESTION';
	this.question = null;
	this.points = prevRound.points || 0;
	this.wrongPoints = prevRound.wrongPoints || 0;
	this.previousBuzzers = [];

};

// var Game = 
var Game = module.exports = function (io) {

	this.rounds = [];

	this.teams = {};
	this.hosts = [];
	this.boards = [];

	this.title = 'NEW TRIVIA GAME - ' + io.name;

	this.currentRound = new Round();
	this.rounds.push(this.currentRound);

	this.newRound = opts => {
		var curr = this.currentRound;
		this.currentRound = new Round(curr);
		this.rounds.push(this.currentRound);

		this.currentRound.prequestionText = opts.prequestionText;
		this.broadcast('game:update', this);
	};

	this.broadcast = function (eventName, data) {
		io.emit(eventName, data);
	};

	// io.use((socket, next) => {
	// 	console.log('MIDDLEWARE IN GAME:', socket.id, socket.handshake.query.type);
	// 	next();
	// });

	io.on('connection', socket => {

		console.log('CLIENT CONNECTED:', socket.id, socket.handshake.query.type);

		if(socket.handshake.query.type === 'team') {
			this.initTeam(socket);
		}

		if(socket.handshake.query.type === 'host') {
			this.initHost(socket);
		}

		if(socket.handshake.query.type === 'board') {

		}
		
		this.broadcast('game:update', this);

		socket.on('disconnect', () => {
			console.log('DISCONNECT:', socket.id);
		});
	});

};

Game.prototype.initTeam = function (socket) {
	console.log('Team Id:', socket.handshake.query.teamId);
	socket._team = this.teams[socket.handshake.query.teamId];

	if(!socket._team) {
		console.log('New Team');
		socket._team = new Team('New Team ' + (Object.keys(this.teams).length + 1));
		this.teams[socket._team.id] = socket._team;
		socket._team.color = 'color-' + (Object.keys(this.teams).length + 1);
	}

	console.log('Team Connected:', socket.id, socket._team.id, socket._team.name);

	socket.emit('team:update', socket._team);

	socket.on('buzz', data => {

		if(this.currentRound.status === 'PAUSED') {
			console.log(`Team: ${socket._team.name} buzzed in too late. ${this.currentRound.buzzed.name} already buzzed.`);
			return;
		}

		console.log(`Team ${socket._team.id} ${socket._team.name} buzzed in.`);
		this.currentRound.buzzed = socket._team;
		this.currentRound.status = 'PAUSED';
		this.broadcast('game:update', this);

	});

	socket.on('team:update', data => {
		socket._team.name = data.name;
		socket._team.color = data.color;
		this.broadcast('game:update', this);
	});
};

Game.prototype.initHost = function(socket) {
	
	this.hosts.push(new Host());

	socket.emit('game:update', this);

	socket.on('game:update', data => {
		this.title = data.title;
		this.broadcast('game:update', this);
	});

	socket.on('round:update', data => {
		Object.keys(data).forEach(k => {
			if(data[k] !== undefined) this.currentRound[k] = data[k];
		});

		if(this.currentRound.status === 'CLOSED') return this.newRound({prequestionText: 'No one won the last round.'});

		this.broadcast('game:update', this);
	});

	socket.on('round:wrong', () => {
		if(this.currentRound.status !== 'PAUSED') return;

		this.currentRound.buzzed.points += this.currentRound.wrongPoints;
		this.currentRound.status = 'OPEN';
		this.currentRound.previousBuzzers.push(this.currentRound.buzzed);
		this.currentRound.buzzed = null;

		this.broadcast('game:update', this);
	});

	socket.on('round:correct', () => {
		if(this.currentRound.status !== 'PAUSED') return;
		this.currentRound.buzzed.points += this.currentRound.points;
		this.currentRound.status = 'CLOSED';

		var lastWinner = this.currentRound.buzzed;

		this.newRound({prequestionText: lastWinner.name + ' won the last round.' });
		this.broadcast('game:update', this);
	});

};

var Host = function (socket) {
	
};

var Team = function (name) {

	this.id = uuid.v4();
	this.name = name;
	this.points = 0;
};