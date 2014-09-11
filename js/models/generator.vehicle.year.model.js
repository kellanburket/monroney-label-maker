define(['jquery', 'underscore', 'backbone', 'vehicle-model'], 
	function($, _, Backbone, VehicleModel) {
	//console.log("Vehicle Years", VehicleModel);

	return Backbone.Model.fullExtend({
		defaults: {
			type: 'year',
			year: null,
		},
		initialize: function(attributes, options) {
			if (this.id) { 
				Backbone.trigger('add_new_year', this);						
			//console.log('New Vehicle Year(' + this.get('year') + ', ' + this.id + ')', this);
			}
		},
		set_id: function(id) {
			this.id = id;
			Backbone.trigger('add_new_year', this);
			Backbone.trigger('postadd:' + id, id, this.get('year'));
		},
		get_constraints: function() {
			return {make_id: this.get('make_id'), model_id: this.get('model_id')};
		},		
		get_collection: function() {
			return null;
		}
	});	
});