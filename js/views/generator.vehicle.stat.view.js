define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	
	var VehicleStat = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.render(attrs.el);
		},
		render: function(el) {
			
			this.el = el;
			this.$el = $(this.el);
			//console.log('el', this, this.$el);
			this.$el.change($.proxy(this.update_field, null, this));
		},
		update_field: function(view) {
			var new_value = $(this).val();
			view.model.set({value: new_value}, {validate: true});
		}
	})

	var initialize = function(attrs, opts) {
		return new VehicleStat(attrs, opts);	
	}
	
	return {initialize: initialize};
});
	