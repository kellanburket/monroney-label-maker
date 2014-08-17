define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {	
	return Option = Backbone.Model.extend({
		defaults: {
			location: '',
			price: 0.00,
			optionName: ''
		},
		initialize: function(attrs, opts) {
			if (this.collection) {
			}
		},
		url: function() {
			return restful.url + '/options?location=' + this.get('location');
		}
	});
});
