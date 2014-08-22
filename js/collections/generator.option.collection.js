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
		}
	});
});
