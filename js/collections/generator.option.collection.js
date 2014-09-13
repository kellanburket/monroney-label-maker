define(['jquery', 'underscore', 'backbone', 'option', 'extended-collection'], function($, _, Backbone, Option, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Option,
		
		initialize: function(attrs, opts) {
			this.location = opts.location;
			this.user = opts.user;
			//console.log('New Options Collection', this.user, this.user);		
			//this.set_listeners();
			Backbone.trigger(this.location + 'OptionsAdded', this);
		},
		
		url: function() {
			return restful.url + 'users/' + this.user.get('name') + '/options/' + this.location;
		},
		
		create: function(attrs, opts) {
			attrs.price = attrs.price || 0;
			attrs.price = this.parse_value(attrs.price);	
			return ExtendedCollection.prototype.create.call(this, attrs, opts);
		},
		
		parse: function(attrs, opts) {
			attrs = ExtendedCollection.prototype.parse.call(this, attrs, opts);						
			console.log("ExtendedOptionCollection:parse", attrs);
			for (var p in attrs) {
				attrs[p].price = this.parse_value(attrs[p].price);
			}
			return attrs;
		},
		
		parse_value: function(val) {
			val = parseFloat(val.toString().replace(/[^0-9\.]/g, ''));
			return parseFloat((Math.round(val * 100)/100).toFixed(2));
		},

	});
});
