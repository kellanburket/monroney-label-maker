define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	
	return Backbone.Model.extend({
		defaults: {
			make: '',
			model: '',
			year: '',
			vin: '',
			msrp: '',
			trim: ''
		},

		initialize: function() {
		},
	});	

});
