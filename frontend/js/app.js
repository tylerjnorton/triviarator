require('./bootstrap.js');

var Mn = require('backbone.marionette');
var Backbone = require('backbone');
var TeamView = require('./views/TeamView');
var HostView = require('./views/HostView');
var BoardView = require('./views/BoardView');
var AppLayoutView = require('./views/AppLayoutView');

var Router = Mn.AppRouter.extend({
	appRoutes: {
		'team': 'showTeam',
		'host': 'showHost',
		'board': 'showBoard'
	}
});

var layout = new AppLayoutView({ el: 'body' });
layout.render();

var App = Mn.Object.extend({
	initialize: function (opts) {
		this.container = opts.container;
		this.router = new Router({ controller: this });
	},
	showTeam: function () {
		this.container.show(new TeamView());
	},
	showHost: function () {
		this.container.show(new HostView());
	},
	showBoard: function () {
		this.container.show(new BoardView());
	},
	showDefault: function () {
		console.log('NO DEFAULT VIEW');
	}
});


window.trivia = new App({
	container: layout.getRegion('container')
});

window.Mn = Mn;

Backbone.history.start();