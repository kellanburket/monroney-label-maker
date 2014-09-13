define(
	['jquery', 'underscore', 'backbone', 'label', 'labels', 'label-view', 'controls', 'imgs-view', 'vehicle-view', 'options-view', 'options', 'discounts-view', 'generic-controls', 'vehicle-make', 'vehicle-model', 'vehicle-year', 'user', 'util/queue'], 
	function($, _, Backbone, Label, Labels, LabelView, Controls, ImgsView, VehicleView, OptionsList, Options, DiscountList, DiscountControls, VehicleMake, VehicleModel, VehicleYear, User, Queue) {
	
	var thread_space = '';
	
	var initialize = function(){
		var rootUser;
		
		$.ajax({
			url: backbone_data.url
		}).done(function(data) {
			if (typeof data !== "object") {
				console.log("User", data);
				var json = $.parseJSON(data);
			}
			
			//console.log("User", json);
			if (json.success == true) {
				rootUser = new User(json, {parse: true});
			} else {
				rootUser = new User({name: "admin", id: 0}, {parse: true});
			}
			
			$(document).ready(function() {		
				
				var label = new Label({user: rootUser, user_id: rootUser.get('id')});
				var labels = new Labels([label], {user: rootUser});
				var view = LabelView.initialize({model: label, collection: labels});
				var pdfControls = Controls.initialize({model: label, collection: labels, user: rootUser});
	
				view.render();
		
				var label_images_view = ImgsView.initialize(
					{
						collection: rootUser.get('customImages'), 
						dropzoneId: 'upload-label', 
						name: 'customImage', 
						pluralName: 'customImages', 
						el:".image-collection"
					}
				);
						
				var label_logos_view = ImgsView.initialize(
					{
						collection: rootUser.get('dealershipLogos'), 
						dropzoneId: 'upload-logo', 
						name: 'dealershipLogo', 
						pluralName: 'dealershipLogos', 
						el: '.logo-collection'
					}
				);	
	
				var vehicle_queue = new Queue;
	
		
				var vehicle_make_view = VehicleView.initialize(
					{
						model: VehicleMake, 
						el: '#vehicleMakeConfig', 
						type: 'make',
						parent_views: {}
					}
				);
						
				var vehicle_model_view = VehicleView.initialize(
					{
						model: VehicleModel, 
						el: '#vehicleModelConfig', 
						type: 'model', 
						parent_views: {
							make: vehicle_make_view
						}
					}
				);	
				
				var vehicle_year_view = VehicleView.initialize(
					{
						model: VehicleYear, 
						el: '#vehicleYearConfig', 
						type: 'year', 
						parent_views: {
							make: vehicle_make_view, 
							model: vehicle_model_view
						}
					}
				);
								
			
				var xOptions = rootUser.get('exteriorOptions');	
				var iOptions = rootUser.get('interiorOptions');
				//console.log("Options", rootUser, xOptions, iOptions);
				var exterior_options_view = OptionsList.initialize(
					{collection: xOptions,
					input_container: '#exterior-input-container', 
					input: '#exterior-input', 
					price_input: '#exterior-price-input',
					add_item: '#add-new-exterior-item', 
					save_button: '#exterior-add-button', 
					el: '#exterior-options'
				});
				
				var interior_options_view = OptionsList.initialize({
					collection: iOptions,
					input_container: '#interior-input-container', 
					input: '#interior-input', 
					price_input: '#interior-price-input',
					add_item: '#add-new-interior-item', 
					save_button: '#interior-add-button', 
					el: '#interior-options'
				});

				$('#generator-spinner-overlay').fadeOut();
				$('#generator-page-loader').fadeOut();	
				
				/*					
				var discounts = rootUser.get('discounts');
				if (discounts) {
					
					var discount_view = DiscountList.initialize({collection: rootUser.get('discounts'), el: "#discountList"});
			
					var discount_controls = DiscountControls.initialize({
						list_view: discount_view, 
						input_fields: {
							type: '[name="discountType"]', 
							discount: '[name="discount"]',
							amount: '[name="discountAmount"]'	   
						},
						add_button: '#discount-add-button'
					});
				}
				*/
	
			});
		}).fail(function(response) {
			//console.log("Fail", response);
		});
	};
		
	return {
		initialize: initialize
	};
});