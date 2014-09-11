//OPTIONS
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	var OptionsListItem = Backbone.View.extend({
		tag: "li",
		initialize: function(attrs, opts) {
			attrs = attrs || {};
			this.activated = this.model.get('activated');
		},
	
		render: function(parent, opts) {
			this.$root = $('<' + this.tag + '>');
			this.$checkbox = $('<input>', {type: 'checkbox', class: 'tag-checkbox'});
			this.$name = $('<span>', {text: this.model.get('optionName')});
			this.$price_wrap = $('<div>', {class: 'option-price float-right'});
			this.$dollar = $('<span>', {text: '$ '});
			this.$x = $('<button>', {text: 'X', class: 'x-mark destroy-button'});
			
			this.$price_input = $('<input>', {type: 'text', class: 'tag-input', value: parseFloat(Math.round(this.model.get('price') * 100) / 100).toFixed(2)});
			this.$price_wrap.append(this.$dollar, this.$price_input);
			this.$root.append(this.$checkbox, this.$name, this.$x, this.$price_wrap);
			
			$(parent.el).prepend(this.$root);
			this.el = $(parent.el).children('li')[0];
			this.$el = $(this.el);
			this.$checkbox = this.$el.children(':checkbox');
	
			//Backbone.trigger('add_option', this.model, this.$price_input.val());

			//console.log('Is It Activated', this.activated, this.model);
			if (this.activated === true) {
				//console.log("Activate Checkbox");
				this.$checkbox.prop('checked', true);
				this.set_checked();
			}

			this.$x.click($.proxy(this.destroy_self, this));
			
			//console.log('Price', this.$price_input.val());
			this.$checkbox.change($.proxy(this.set_checked, this));
			//this.set_checked();
			return this;	
		},
		
		destroy_self: function() {
			Backbone.trigger("destroyOption", this.model, this.model.url());		
		},
		
		reset: function() {
			//console.log('Request Reset');
			Backbone.trigger('remove_option', this.model, this.$price_input.val());	
			this.$checkbox.prop('checked', false);
		},
		
		set_checked: function() {
			var checked = this.$checkbox.prop('checked');
			//console.log("Setting Checked", checked);
	
			if (checked) {
				Backbone.trigger('add_option', this.model, this.$price_input.val());	
			} else {
				Backbone.trigger('remove_option', this.model, this.$price_input.val());	
			}
		}
		
		
	});
	
	var initialize = function(attrs, opts) {
		return new OptionsListItem(attrs, opts);
	}
	
	return {initialize: initialize};
});