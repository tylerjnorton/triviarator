var Backbone = require('backbone');

var RoundModel = Backbone.Model.extend({
	initialize: function (data, opts) {
		this.socket = opts.socket;
		this.socket.on('game:update', data => this.update(data));
	},
	update: function (data) {
		this.set(data.rounds[data.rounds.length - 1]);
	},
	save: function () {
		this.socket.emit('round:update', this.toJSON());
	},
	correct: function () {
		this.socket.emit('round:correct');
	},
	wrong: function () {
		this.socket.emit('round:wrong');
	}
});

module.exports = Backbone.Model.extend({
	initialize: function (data, opts) {
		this.socket = opts.socket;
		this.socket.on('game:update', data => this.update(data));

		this.currentRound = new RoundModel({}, {socket: this.socket});
	},
	update: function (data) {
		console.log('GAME UPDATED:', data);
		this.set(data);
	},
	save: function () {
		this.socket.emit('game:update', this.toJSON());
	},
	buzzIn: function () {
		this.socket.emit('buzz');
	}
});