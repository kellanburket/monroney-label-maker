define(
	['jquery', 'underscore', 'backbone', 'vehicle-make', 'vehicle-year', 'vehicle-type'], 
	function($, _, Backbone, VehicleMake, VehicleYear, VehicleType) 
	{
		//console.log("Vehicle Model", VehicleMake);
		return Backbone.Model.fullExtend({
		defaults: {
			type: 'model',
			model: null,
			make_id: null,
			years: null,
		},
		get_constraints: function() {
			return {make_id: this.get('make_id')};
		},		
		initialize: function(attributes, options) {
			var model = this;
			if (this.id) {
				this.listenTo(Backbone, 'yearsCollected', this.set_years);
			}
		//console.log('New Vehicle Model(' + model.get('model') + ', ' + model.id + ')', model.attributes);
		},
		
		set_years: function(years) {
			Backbone.trigger('add_new_model', this);	
			Backbone.trigger('postadd:' + this.id, this.id, this.get('model'));
			var data = _.where(years, {model_id: this.id, make_id: this.get('make_id')});
			
			var years = new VehicleType([], {
				data: data, 
				model: VehicleYear, 
				url: restful.url + 'years?model_id=' + this.id + '&make_id=' + this.get('make_id'), 
				type: 'year:model_id:' + this.id
			});
			//console.log('New Years(' + this.id + ')', years);

			return this.set('years', years);
		},
		set_id: function(id) {
			this.id = id;
			return this.set_years();
		},
		get_collection: function() {
			return this.years;
		},
		urlRoot: restful.url + '/models'
	});
});