
	var Discounts = Backbone.Collection.extend({
		model: Discount,
		url: restful.url + '/discounts'
	});

	var Discount = Backbone.Model.extend({
		defaults: {
			type: '',
			amount: ''
		},
		urlRoot: restful.url + '/discounts'
	});	
