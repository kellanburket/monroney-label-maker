var User = Backbone.Model.extend({
	
	defaults: {
		id: 0,
		name: '',
		labels: {},
		images: {},
		models: {},
		makes: {},
		years: {},
		logos: {},
		discounts: {},
		exteriorOptions: {},
		interiorOptions: {},
	},
	
	initialize: function(data, opts) {
				
		console.log("RootUser", data);
		if (data.id) {
			this.set('id', data.id);
		}
				
		if (data.name) {
			this.set('name', data.name);
		}

		this.set('logos', this.parse_user_collections(Imgs, data.labelgen_logos || {}, {el: "#upload-logo", name: "dealershipLogo", pluralName: "dealershipLogos", url: restful.url + 'logos', userId: data.id}));

		this.set('images', this.parse_user_collections(Imgs, data.labelgen_images || {}, {el: ".image-collection", name: "customLabel", pluralName: "customLabels", url: restful.url + 'label_images', userId: data.id}));
		
		if (data.labelgen_labels) {
			this.set('labels', this.parse_user_collections(Labels, data.labelgen_labels, {userId: data.id}));
		}
		
		if (data.labelgen_makes) {
			this.set('makes', this.parse_user_collection(VehicleType, data.labelgen_makes, {model: VehicleMake, url: restful.url + 'makes', type: 'make', userId: data.id}));
		}
		
		if (data.labelgen_models) {
			this.set('models', this.parse_user_collection(VehicleType, data.labelgen_models, {model: VehicleModel, url: restful.url + 'models', type: 'model', userId: data.id}));
		}
		
		if (data.labelgen_years) {
			this.set('years', this.parse_user_collection(VehicleType, data.labelgen_years, {model: VehicleYear, url: restful.url + 'years', type: 'year', userId: data.id}));
		} 
		
		if (data.exterior_options) {
			this.set('exteriorOptions', this.parse_user_collection(Option, data.exterior_options, {url: restful.url + '/options?location=exterior', userId: data.id})); 
		}
		
		if (data.interior_options) {
			this.set('interiorOptions', this.parse_user_collection(Option, data.interior_options, {url: restful.url + '/options?location=interior', userId: data.id})); 
		}

		if (data.labelgen_discounts) {
			this.set('discounts', this.parse_user_collection(Discount, data.labelgen_discounts, {userId: data.id})); 
		}
		
		this.listenTo(Backbone, "requestUserId", this.send_user_id);

	},
	
	parse_user_collections: function(Collection, data, options) {
		options = options || {};
		var collection = new Collection([], options);
		console.log(collection.model);
		collection.add(data, {parse: true});
		return collection;
	},
	
	send_user_id: function() {
		var id = this.get('id');

		console.log('send user id', id);
		if (id > 0) {
			Backbone.trigger('returnUserId', id);
		} else {
			Backbone.trigger('showFailMessage', 'You must be logged in to perform this action!');
		}
	}
});