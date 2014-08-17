define(['jquery', 'underscore', 'backbone', 'vehicle-model', 'vehicle-type'], function($, _, Backbone, VehicleModel, VehicleType) {

	return Backbone.Model.fullExtend({
		defaults: {
			type: 'make',
			id: null,
			make: null,
			models: null
		},
		initialize: function(attributes, options) {
			var model = this;
			Backbone.trigger('add_new_make', this);
			if (this.id) {
				this.listenTo(Backbone, 'modelsCollected', this.set_models);
			}
		},
		get_constraints: function() {
			return {};
		},
		set_models: function(models) {
		//console.log("New Vehicle Make(" + this.id + "): " + this.get('make'));

			//console.log('App.models', App.models);
			var data = _.where(models, {make_id: this.id});
			var models = new VehicleType([], {
				data: data, 
				url: restful.url + 'models?make_id=' + this.id, 
				model: VehicleModel, 
				type: 'model:make_id:' + this.id}
			);

			return this.set('models', models);
		},
		set_id: function(id) {
			this.id = id;
			Backbone.trigger('postadd:' + this.id, this.id, this.get('make'));
			//Todo set up a request here and then defer the function requesting the models
			return this.set_models();
		},
		get_collection: function() {
			return this.models;
		},
		get_sucess_message: function(arguments) {
			//console.log('Success:' + this.get(this.get('type')), arguments);
		},
		get_error_message: function(arguments) {
			//console.log('Error:' + this.get(this.get('type')), arguments);		
		},
		urlRoot: function() { 
			////console.log(this);
			//return restful.url + 'makes/' + this.cid;
		}
	});
});