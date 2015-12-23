var Mn = require('backbone.marionette');
var io = require('socket.io-client/socket.io.js');
var GameModel = require('../models/GameModel');

var HeaderView = Mn.ItemView.extend({
	template: require('../templates/host-header.jade'),
	modelEvents: {
		'change': 'render'
	}
});

var PlayView = Mn.ItemView.extend({
	template: require('../templates/host-play.jade'),
	modelEvents: {
		'change': 'render'
	},
	events: {
		'click .open-question': 'openQuestion',
		'click .close-question': 'closeQuestion',
		'click .wrong-btn': 'wrong',
		'click .correct-btn': 'correct',
		'click .wrong-points-adjuster .plus': 'plusWrongPoints',
		'click .correct-points-adjuster .plus': 'plusCorrectPoints',
		'click .wrong-points-adjuster .minus': 'minusWrongPoints',
		'click .correct-points-adjuster .minus': 'minusCorrectPoints'
	},
	openQuestion: function () {
		var question = this.$el.find('.question').val();
		var title = this.$el.find('.question-title').val();
		this.model.currentRound.set({
			status: 'OPEN',
			question: question,
			title: title
		});
		this.model.currentRound.save();
	},
	closeQuestion: function () {
		this.model.currentRound.set({ status: 'CLOSED' });
		this.model.currentRound.save();
	},
	wrong: function () {
		this.model.currentRound.wrong();
	},
	correct: function () {
		this.model.currentRound.correct();
	},
	setCurrentRoundStatus: function (status) {
		this.model.currentRound.set({ status: status });
		this.model.currentRound.save();
	},
	plusWrongPoints: function () {

		var question = this.$el.find('.question').val();
		var title = this.$el.find('.question-title').val();

		var wrongPoints = this.model.currentRound.get('wrongPoints');
		wrongPoints += 5;
		this.model.currentRound.set({ wrongPoints: wrongPoints, question: question, title: title });
		this.model.currentRound.save();
	},
	plusCorrectPoints: function () {
		var question = this.$el.find('.question').val();
		var title = this.$el.find('.question-title').val();
		var points = this.model.currentRound.get('points');
		points += 5;
		this.model.currentRound.set({ points: points, question: question, title: title });
		this.model.currentRound.save();
	},
	minusWrongPoints: function () {
		var question = this.$el.find('.question').val();
		var title = this.$el.find('.question-title').val();
		var wrongPoints = this.model.currentRound.get('wrongPoints');
		wrongPoints -= 5;
		this.model.currentRound.set({ wrongPoints: wrongPoints, question: question, title: title });
		this.model.currentRound.save();
	},
	minusCorrectPoints: function () {
		var question = this.$el.find('.question').val();
		var title = this.$el.find('.question-title').val();
		var points = this.model.currentRound.get('points');
		points -= 5;
		this.model.currentRound.set({ points: points, question: question, title: title });
		this.model.currentRound.save();
	}
});

var EditView = Mn.ItemView.extend({
	template: require('../templates/host-edit.jade'),
	events: {
		'click button': 'saveChanges'
	},
	saveChanges: function () {
		var title = this.$el.find('input').val();
		this.model.set({title: title});
		this.model.save();
		this.trigger('done-edit');
	}
});

module.exports = Mn.LayoutView.extend({
	template: require('../templates/host-view.jade'),
	className: 'wrapper',
	regions: {
		'main': 'main',
		'header': 'header',
		'footer': 'footer'
	},
	events: {
		'click .edit-btn': 'showEdit'
	},
	initialize: function () {
		this.socket = io(':7777/game1', {query: 'type=host'});

		this.model = new GameModel({}, { socket: this.socket });

		this.socket.emit('host:join');
	},
	onShow: function () {
		this.getRegion('header').show(new HeaderView({ model:this.model }));
		
		this.showPlay();
	},
	showEdit: function () {
		var editView = new EditView({ model: this.model });
		this.listenTo(editView, 'done-edit', this.showPlay);
		this.getRegion('main').show(editView);
	},
	showPlay: function () {
		this.getRegion('main').show(new PlayView({ model: this.model }));
	}
});