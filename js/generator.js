(function($) {		
	function LabelGenerator() {
		this.label = new Label({user_id: 0, user: new User({id: 0})});
		this.labels = new Labels([this.label]);
		this.view = new LabelView({model: this.label, collection: this.labels});

		this.pdfControls = new PDFControls({model: this.label, collection: this.labels});

		this.view.render();

		console.log("Root", rootUser);

		this.label_images_view = new ImgsView({collection: rootUser.get('images'), dropzoneId: 'upload-label', name: 'customLabel', pluralName: 'customLabels', el:".image-collection"});		
		this.label_logos_view = new ImgsView({collection: rootUser.get('logos'), dropzoneId: 'upload-logo', name: 'dealershipLogo', pluralName: 'dealershipLogos', el: "#upload-logo"});	

		this.vehicle_make_view = new VehicleView({model: VehicleMake, el: '#vehicleMakeConfig', type: 'make',
			parent_views: {}});		
		this.vehicle_model_view = new VehicleView({model: VehicleModel, el: '#vehicleModelConfig', type: 'model', 
			parent_views: {make: this.vehicle_make_view}});	
		this.vehicle_year_view = new VehicleView({model: VehicleYear, el: '#vehicleYearConfig', type: 'year', 
			parent_views: {make: this.vehicle_make_view, model: this.vehicle_model_view}});
		
		this.vehicle_stock_no = new VehicleStat({model: this.stockNoModel, el:'[name=stockNo]'});
		this.vehicle_vin = new VehicleStat({model: this.vinModel, el:'[name=vin]'});
		this.vehicle_msrp = new VehicleStat({model: this.msrpModel, el:'[name=msrp]'});
		this.vehicle_trim = new VehicleStat({model: this.trimModel, el:'[name=trim]'});
				
		this.exterior_options_view = new OptionsList(
			{collection: new Options([], {location: "exterior", url: restful.url + '/options?location=exterior'}), //rootUser.get('exterior_options') ||
			input_container: '#exterior-input-container', 
			input: '#exterior-input', 
			price_input: '#exterior-price-input',
			add_item: '#add-new-exterior-item', 
			save_button: '#exterior-add-button', 
			el: '#exterior-options'});
		
		this.interior_options_view = new OptionsList({
			collection: new Options([], {location: "interior", url: restful.url + '/options?location=exterior'}), //rootUser.get('interior_options') || 
			input_container: '#interior-input-container', 
			input: '#interior-input', 
			price_input: '#interior-price-input',
			add_item: '#add-new-interior-item', 
			save_button: '#interior-add-button', 
			el: '#interior-options'});
		
		//this.discount_view = new DiscountList({collection: rootUser.get('discounts'), el: "#discountList"});

		this.discount_controls = new Controls({
			list_view: this.discount_view, 
			input_fields: {
				type: '[name="discountType"]', 
				discount: '[name="discount"]',
				amount: '[name="discountAmount"]'	   
			},
			add_button: '#discount-add-button'
		});
		var workspace = new Workspace();
	};


	$(document).ready(function() {
		var generator = new LabelGenerator();
		$('.tag-tab-holder').click(function() {
			var id = $(this).attr('id').split('-')[3];
			
			$('.tag-tab-holder').each(function() {
				$(this).removeClass('active');
				$(this).addClass('inactive');
			});
			
			$('.tag-frame').addClass('invisible');
			$('#tag-frame-' + id).removeClass('invisible');
			
			$(this).addClass('active');
			$(this).removeClass('inactive');
		});
		
		
		Backbone.history.start();
	});

	$(window).load(function() {
		$('#generator-spinner-overlay').fadeOut();
		$('#generator-page-loader').fadeOut();	
	});


})(jQuery);