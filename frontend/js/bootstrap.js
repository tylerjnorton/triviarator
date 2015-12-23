var Marionette = require('backbone.marionette');

Marionette.Renderer.render = function (template, data, view) {
	if (!template) {
      throw new Marionette.Error({
        name: 'TemplateNotFoundError',
        message: 'Cannot render the template since its false, null or undefined.'
      });
    }

    if (typeof template === 'string') return template;

    data.__view = view;

    return template(data);
};