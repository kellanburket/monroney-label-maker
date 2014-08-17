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
			var q_string = ''
			
			if (this.userId) {
				q_string = '?user_id=' + this.userId;
			}
			
			return 'api/labels' + q_string;
		}
	});
});
