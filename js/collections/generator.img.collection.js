define(['jquery', 'underscore', 'backbone', 'img', 'extended-collection'], function($, _, Backbone, Img, ExtendedCollection) {
	return ExtendedCollection.extend({
		model: Img,		
		initialize: function(models, opts) {
			//console.log("New Imgs Collection", this);
			this.url = opts.url;
			this.user = opts.user;
			this.name = opts.name;

			this.ucfirst_name = this.name.charAt(0).toUpperCase() + this.name.substr(1, this.name.length);
			this.pluralName = opts.pluralName;
			
			var request = 'request' + this.ucfirst_name;			
			this.listenTo(Backbone, request, this.handle_request); 
			this.listenTo(Backbone, 'userLoggedIn', this.set_user_id);
		},

		handle_request: function(id) {
			var model = this.get(id);
			//console.log('Handle Request', id, model);
			if (model) {
				Backbone.trigger('return' + this.ucfirst_name, model); 
			}
		},		
	});
});