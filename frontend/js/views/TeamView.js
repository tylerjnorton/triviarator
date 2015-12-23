var Mn = require('backbone.marionette');
var io = require('socket.io-client/socket.io.js');
var TeamModel = require('../models/TeamModel');
var GameModel = require('../models/GameModel');

var HeaderView = Mn.ItemView.extend({
	template: require('../templates/team-header.jade'),
	modelEvents: {
		'change': 'render'
	}
});

var FooterView = Mn.ItemView.extend({
	template: require('../templates/team-footer.jade'),
	modelEvents: { 'change': 'render' }
});

var TeamEditView = Mn.ItemView.extend({
	template: require('../templates/team-edit.jade'),
	events: {
		'click button': 'saveChanges',
		'click .color-box': 'updateColor'
	},
	updateColor: function (e) {
		var el = this.$el.find(e.currentTarget);
		var color = el.attr('color');
		this.model.set({color: color});
		this.model.save();
	},
	saveChanges: function () {
		var name = this.$el.find("input").val();
		this.model.set({ name: name });
		this.model.save();
		this.trigger('edit-done');
	}
});

var TeamPlayView = Mn.ItemView.extend({
	initialize: function (opts) {
		this.team = opts.team;
	},
	template: require('../templates/team-play.jade'),
	modelEvents: {
		'change': 'render'
	},
	events: {
		'click .buzzer': 'buzzIn'
	},
	buzzIn: function () {
		this.model.buzzIn();
	},
	hasBuzzedIn: function () {
		var rounds = this.model.get('rounds');
		var currentRound = rounds[rounds.length - 1];
		return currentRound.previousBuzzers.some(p => p.id === this.team.id);
	},
	templateHelpers: function () {
		return { team: this.team.toJSON() };
	}
});

module.exports = Mn.LayoutView.extend({
	template: require('../templates/team-view.jade'),
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

		var teamId = localStorage.getItem('teamId');

		console.log("TEAM: " + teamId);

		this.socket = io(':7777/game1', {query: 'type=team&teamId=' + teamId });


		// model stuff
		this.model = new TeamModel({}, { socket: this.socket });
		this.game = new GameModel({}, { socket: this.socket });
		
	},
	onShow: function () {
		this.getRegion('footer').show(new FooterView({ model: this.model }));
		this.getRegion('header').show(new HeaderView({ model:this.model }));
		this.showPlay();
	},
	showEdit: function () {
		var editView = new TeamEditView({ model: this.model });
		this.listenTo(editView, 'edit-done', this.showPlay);
		this.getRegion('main').show(editView);
	},
	showPlay: function () {
		this.getRegion('main').show(new TeamPlayView({ model: this.game, team: this.model }));
	}
});