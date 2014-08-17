define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	return Backbone.Model.extend({
		defaults: {
			type: '',
			discount: '',
			amount: 0
		},
	});
});