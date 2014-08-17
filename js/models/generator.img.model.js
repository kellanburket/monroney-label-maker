define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	return Backbone.Model.extend({
		defaults: {
			guid: '',
			id: ''
		},
		initialize: function(attrs, opts) {
			console.log("New Img", this);	
		},
	});	
});
