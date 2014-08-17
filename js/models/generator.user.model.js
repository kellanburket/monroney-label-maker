define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	return Backbone.Model.extend({
		
		defaults: {
			id: 0,
			secret: '',
			name: '',
			labels: {},
			customImages: {},
			models: {},
			makes: {},
			years: {},
			dealershipLogos: {},
			discounts: {},
			exteriorOptions: {},
			interiorOptions: {},
		},
		
		initialize: function(data, opts) {
			this.listenTo(Backbone, "requestUserId", this.send_user_id);
		},
		
		parse: function(data) {
			var attrs = {};
			if (data.id) {
				attrs.id = data.id;
			}
					
			if (data.name) {
				attrs.name = data.name;
			}
			
			if (data.secret) {
				attrs.secret = data.secret;
			}
			
			attrs.dealershipLogos = this.parse_user_collections(
				Imgs, 
				data.labelgen_logos || {}, 
				{
					el: ".logo-collection", 
					name: "dealershipLogo", 
					pluralName: "dealershipLogos", 
					url: restful.url + 'logos', 
					userId: data.id
				}
			);
	
			attrs.customImages = this.parse_user_collections(
				Imgs, 
				data.labelgen_images || {}, 
				{
					el: ".image-collection", 
					userId: data.id,
					name: "customImage", 
					pluralName: "customImages", 
					url: restful.url + 'label_images', userId: data.id
				}
			);
			
			if (data.labelgen_labels) {
				attrs.labels = this.parse_user_collections(
					Labels, 
					data.labelgen_labels, 
					{
						userId: data.id
					}
				);
			}
			
			if (data.labelgen_makes) {
				attrs.makes = this.parse_user_collections(
					VehicleType, 
					data.labelgen_makes, 
					{
						model: VehicleMake, 
						url: restful.url + 'makes', 
						type: 'make', 
						userId: data.id
					}
				);
			}
			
			if (data.labelgen_models) {
				attrs.models = this.parse_user_collections(
					VehicleType, 
					data.labelgen_models, 
					{
						userId: data.id,
						model: VehicleModel, 
						url: restful.url + 'models', 
						type: 'model', userId: data.id
					}
				);
			}
			
			if (data.labelgen_years) {
				attrs.years = this.parse_user_collections(
					VehicleType, 
					data.labelgen_years, 
					{
						model: VehicleYear, 
						url: restful.url + 'years', 
						type: 'year', 
						userId: data.id
					}
				);
			} 
			
			if (data.exterior_options) {
				attrs.exteriorOptions = this.parse_user_collections(
					Options, 
					data.exterior_options, 
					{
						userId: data.id,
						location: 'exterior'
					}
				);
			}
			
			if (data.interior_options) {
				attrs.interiorOptions = this.parse_user_collections(
					Options, 
					data.interior_options, 
					{
						userId: data.id,
						location: 'interior'
					}
				);
			}
	
			if (data.labelgen_discounts) {
				attrs.discounts = this.parse_user_collections(
					Discounts, 
					data.labelgen_discounts, 
					{
						userId: data.id
					}
				);
			}
			
			console.log("Parsing New User", attrs);
			return attrs;
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
});