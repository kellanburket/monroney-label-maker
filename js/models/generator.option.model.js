define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {	
	return Option = Backbone.Model.extend({
		defaults: {
			location: '',
			price: 0.00,
			optionName: '',
			id: ''
		},
		
		get_display_price: function() {
			value = parseFloat(this.get("price")).toFixed(2);
			value = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
			return "$" + value;
		}
	});
});
