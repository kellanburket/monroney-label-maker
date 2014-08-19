define(['jquery', 'underscore', 'backbone', 'option', 'extended-collection'], function($, _, Backbone, Option, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Option,
		initialize: function(attrs, opts) {
			//console.log('New Options Collection', this);		
			this.location = opts.location;
			this.userId = opts.userId;
			this.userName = opts.userName;
			this.set_listeners();
			Backbone.trigger(this.location + 'OptionsAdded', this);
		},
		url: function() {
			return restful.url + 'users/' + this.userName + '/options/' + this.location;
		}
		
	});
});
