define(['jquery', 'underscore', 'backbone', 'label', 'extended-collection'], function($, _, Backbone, Label, ExtendedCollection) {

	return ExtendedCollection.extend({
		model: Label,
			
		initialize: function(models, options) {
			console.log("New Label", models, options);
			this.user = options.user;
			this.listenTo(Backbone, 'userLoggedIn', this.set_user_id);
		},
		
		clone_model: function(model, value, opts) {
			var changes = model.changedAttributes();			
			//console.log('Clone Model', changes, model, value);
		},
		url: function() {
			return restful.url + 'users/' + this.user.get('name') + '/labels';
		}
	});
});
