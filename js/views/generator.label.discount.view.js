define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var LabelDiscount = Backbone.View.extend({
		tag: 'li',
		class: 'discount font-arial px-10',
		initialize: function() {
			this.render();
		},
		render: function() {
			var symbol_before = (this.model.get('type') == "Value") ? '$' : '';
			var symbol_after = (this.model.get('type') == "Percentage") ? '%' : '';
			var discount_name = this.model.get('discount');
			$tag = $('<' + this.tag + '>', {class: this.class, id: 'discount_' + discount_name.replace(/\s/, '_')});
			$name = $('<span>', {class: 'basal-font', text: discount_name, id: 'discount_' + discount_name.replace(/\s/, '_') + '_name'});
			$value = $('<span>', {class: 'float-right basal-font', text: "- " + symbol_before + this.model.get('amount').toFixed(2) + symbol_after, id: 'discount_' + discount_name.replace(/\s/, '_') + '_value'});
			
			$tag.append($name, $value);

			$('#discounts').prepend($tag);
			this.el = $('#discounts').children('li')[0];
		},
		detach_from_view: function(label_view) {
		//console.log(this);
			$(this.el).remove();
		}
	});

	var initialize = function() {
			
	}
	
	return {
		initialize: initialize
	};
});
	