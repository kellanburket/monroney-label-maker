define(['jquery', 'underscore', 'backbone', 'discount', 'extended-collection'], function($, _, Backbone, Discount, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Discount,
		initialize: function(attrs, opts) {
			_.each(attrs, function(element, index, list) {
				var discount = new Discount(element);
				this.add(discount);		
			}, this);
			this.user = opts.user;
			this.url = restful.url + "users/" + this.user.get('name') + "/discounts";
		},
	});
});