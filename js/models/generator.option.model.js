define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {	
	return Option = Backbone.Model.extend({
		defaults: {
			location: '',
			price: 0.00,
			optionName: '',
			id: ''
		}
	});
});
