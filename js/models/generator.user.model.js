define(['jquery', 'underscore', 'backbone', 'options', 'discounts', 'imgs', 'vehicle-type', 'labels'], function($, _, Backbone, Options, Discounts, Imgs, VehicleType, Labels) {

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
					url: restful.url + 'users/' + attrs.name + '/logos', 
					user: this
				}
			);
	
			attrs.customImages = this.parse_user_collections(
				Imgs, 
				data.labelgen_images || {}, 
				{
					el: ".image-collection", 
					name: "customImage", 
					pluralName: "customImages", 
					url: restful.url + 'users/' + attrs.name + '/images',
					user: this
				}
			);
			
			if (data.labelgen_labels) {
				attrs.labels = this.parse_user_collections(
					Labels, 
					data.labelgen_labels, 
					{
						user: this
					}
				);
			}
			
			if (data.labelgen_makes) {
				attrs.makes = this.parse_user_collections(
					VehicleType, 
					data.labelgen_makes, 
					{
						model: VehicleMake, 
						url: restful.url + 'users/' + attrs.name + '/makes', 
						type: 'make', 
						user: this
					}
				);
			}
			
			if (data.labelgen_models) {
				attrs.models = this.parse_user_collections(
					VehicleType, 
					data.labelgen_models, 
					{
						model: VehicleModel, 
						url: restful.url + 'users/' + attrs.name + '/models', 
						type: 'model',
						user: this
					}
				);
			}
			
			if (data.labelgen_years) {
				attrs.years = this.parse_user_collections(
					VehicleType, 
					data.labelgen_years, 
					{
						model: VehicleYear, 
						url: restful.url + 'users/' + attrs.name + '/years', 
						type: 'year', 
						user: this
					}
				);
			} 
			
			if (data.exterior_options) {
				attrs.exteriorOptions = this.parse_user_collections(
					Options, 
					data.exterior_options, 
					{
						location: 'exterior',
						user: this
					}
				);
			}
			
			if (data.interior_options) {
				attrs.interiorOptions = this.parse_user_collections(
					Options, 
					data.interior_options, 
					{
						location: 'interior',
						user: this
					}
				);
			}
	
			if (data.labelgen_discounts) {
				attrs.discounts = this.parse_user_collections(
					Discounts, 
					data.labelgen_discounts, 
					{
						user: this
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
			var name = this.get('name');
			var secret = this.get('secret');
	
			console.log('send user id', id);
			if (id > 0) {
				Backbone.trigger('returnUserId', id, name, secret);
			} else {
				Backbone.trigger('showFailMessage', 'You must be logged in to perform this action!');
			}
		}
	});
});