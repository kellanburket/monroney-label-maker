define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var LabelOption = Backbone.View.extend({
		tag: 'li',
		class: 'option font-arial px-10',
		
		initialize: function(attrs) {
			this.render();
		},
		
		render: function() {
			var option_name = this.model.get('optionName');
			$tag = $('<' + this.tag + '>', {class: this.class, id: 'option_' + option_name.replace(/\s/, '_')});
			$name = $('<span>', {text: option_name, class: 'basal-font', id: 'option_' + option_name.replace(/\s/, '_') + '_name'});
			$value = $('<span>', {class: 'float-right basal-font', text: '+ $' + parseFloat(this.model.get('price')).toFixed(2), id: 'option_' + option_name.replace(/\s/, '_') + '_value'});
			$tag.append($name, $value);
			
			$('#' + this.model.get('location') + 'Options').prepend($tag);	
			this.el = $('#' + this.model.get('location') + 'Options').children('li')[0];
		//console.log(this.el);
		},
		detach_from_view: function(label_view) {
			//console.log(this);
			$(this.el).remove();
		}
	});
	
	var initialize = function() {
		return new LabelOption(attrs, opts);
	};

	return {initialize: initialize};
});