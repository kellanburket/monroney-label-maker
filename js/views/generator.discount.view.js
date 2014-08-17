define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	
	var DiscountItem = Backbone.View.extend({
		class: 'discountListItem',
		tag: 'li',
		initialize: function() {
			return this.render();
		},
		render: function() {
			this.el = $("<" + this.tag + ">", {class: this.class + " striped-list"});
			$ul = $('<ul>', {class: 'inline-list'});
			$checkbox = $('<input>', {type: 'checkbox', class: 'tag-checkbox'});
			$discount = $('<li>', {text: this.model.get('discount')});
			$type = $('<li>', {text: "(" + this.model.get('type') + ")"});
			$amount = $('<li>', {text: "$" + parseFloat(Math.round(this.model.get('amount') * 100) / 100).toFixed(2), class: 'float-right'});

			$ul.append($checkbox, $discount, $type, $amount);
			this.el.append($ul);
			
			var item = this;
			$checkbox.change(function() {
		//console.log($(this));
				var checked = $(this).prop('checked');
			//console.log('Checked', checked);
				if (checked) {
					Backbone.trigger('add_discount', item.model);	
				} else {
					Backbone.trigger('remove_discount', item.model);	
				}										
			});
			return this;			
		}
	});


	var initialize = function(attrs, opts) {
		return new DiscountItem(attrs, opts);
	}
	
	return {initialize: initialize};
});