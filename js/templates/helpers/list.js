define('templates/helpers/list', ['hbs/handlebars', 'jquery', 'underscore'], function(Handlebars, $, _) {
	var list = function(items, options) {
		var out = '';
		_.each(items, function(el, i, li) {
			out += '<label class="tag-label" for="' + el.field.attr('name') + '">' + el.label + '</label>';
			$div = $('<div>');
			$div.append(el.field);
			out += $div.html();
		}, this);
		return out;			
	};
	
	Handlebars.registerHelper('list', list);
	return list;
});