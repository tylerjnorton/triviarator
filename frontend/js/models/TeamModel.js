var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
	initialize: function (data, opts) {
		console.log(opts);
		this.socket = opts.socket;

		this.socket.on('team:update', data => this.update(data));
	},
	update: function (data) {
		this.set(data);

		if(data.id) localStorage.setItem('teamId', data.id);
	},
	save: function () {
		this.socket.emit('team:update', this.toJSON());
	}
});