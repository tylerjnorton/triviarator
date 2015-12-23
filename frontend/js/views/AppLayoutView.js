var Mn = require('backbone.marionette');

module.exports = Mn.LayoutView.extend({
	template: require('../templates/layout.jade'),
	regions: {
		'container': '#container'
	}
});