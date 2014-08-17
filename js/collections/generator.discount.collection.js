define(['jquery', 'underscore', 'backbone', 'discount', 'extended-collection'], function($, _, Backbone, Discount, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Discount,
		initialize: function(attrs, opts) {
			_.each(attrs, function(element, index, list) {
				var discount = new Discount(element);
			//console.log(discount);
				this.add(discount);		
			}, this);
			
			this.model = Discount;
			this.url = restful.url + "discounts";
		},
	});
});