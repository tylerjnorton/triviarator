var Mn = require('backbone.marionette');
var io = require('socket.io-client/socket.io.js');
var GameModel = require('../models/GameModel');


module.exports = Mn.ItemView.extend({
	template: require('../templates/board-view.jade'),
	className: 'wrapper',
	initialize: function () {

		this.socket = io(':7777/game1', {query: 'type=board'});

		// model stuff
		this.model = new GameModel({}, { socket: this.socket });
		
		this.socket.emit('board:join');

		this.listenTo(this.model, 'change', this.render);

	}
});