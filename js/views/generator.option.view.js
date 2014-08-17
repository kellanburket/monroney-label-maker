//OPTIONS
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	var OptionsListItem = Backbone.View.extend({
		tag: "li",
		initialize: function(attrs, opts) {
			console.log("Initializing Option List Item");
		},
	
		render: function(parent) {
			console.log("Rendering Option List Item", parent);
			$root = $('<' + this.tag + '>');
			$checkbox = $('<input>', {type: 'checkbox', class: 'tag-checkbox'});
			$name = $('<span>', {text: this.model.get('optionName')});
			$price_wrap = $('<div>', {class: 'option-price float-right'});
			$dollar = $('<span>', {text: '$ '});
			
			this.$price_input = $('<input>', {type: 'text', class: 'tag-input', value: this.model.get('price')});
			$price_wrap.append($dollar, this.$price_input);
			$root.append($checkbox, $name, $price_wrap);
			
			$(parent.el).prepend($root);
			this.el = $(parent.el).children('li')[0];
			this.$el = $(this.el);
			this.$checkbox = this.$el.children(':checkbox');
	
			Backbone.trigger('add_option', this.model, this.$price_input.val());
			this.set_checked();
			
			
			//console.log('Price', this.$price_input.val());
			this.$checkbox.change($.proxy(this.set_checked, this));
			return this;	
		},
		
		set_checked: function() {
			var checked = this.$checkbox.prop('checked');
			console.log("Setting Checked", checked);
	
			if (checked) {
				Backbone.trigger('add_option', this.model, this.$price_input.val());	
			} else {
				Backbone.trigger('remove_option', this.model, this.$price_input.val());	
			}
		}
		
		
	});
	
	var initialize = function(attrs, opts) {
		return new OptionListItem(atts, opts);
	}
	
	return {initialize: initialize};
});