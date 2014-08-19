define(['jquery', 'underscore', 'backbone', 'label', 'extended-collection'], function($, _, Backbone, Label, ExtendedCollection) {

	return ExtendedCollection.extend({
		model: Label,
		
		initialize: function(models, options) {
			this.userId = null;
			this.userName = null;
		},
		
		clone_model: function(model, value, opts) {
			var changes = model.changedAttributes();			
			//console.log('Clone Model', changes, model, value);
		},
		url: function() {
			return restful.url + 'users/' + this.userName + '/labels';
		}
	});
});
