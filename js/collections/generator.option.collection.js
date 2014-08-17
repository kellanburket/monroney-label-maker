define(['jquery', 'underscore', 'backbone', 'extended-collection'], function($, _, Backbone, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Option,
		initialize: function(attrs, opts) {
			//console.log('New Options Collection', this);		
			this.location = opts.location;
			this.userId = opts.userId;
			this.set_listeners();
			this.url = restful.url + 'options?location=' + this.location;
			Backbone.trigger(this.location + 'OptionsAdded', this);
		}
	});
});
