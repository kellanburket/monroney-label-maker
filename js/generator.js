jQuery(document).ready(function($) {
		
	function LabelGenerator() {
		
		this.label = new Label({user_id: 0});
		this.labels = new Labels([this.label]);

		this.trimModel = new LabelFieldModel({type: 'trim'});
		this.vinModel = new VIN();
		this.msrpModel = new MSRP();
		this.stockNoModel = new LabelFieldModel({type: 'stockNo'});

		this.fields = {
			make: new LabelField({model: new LabelFieldModel({type: 'make'}), el: '#make'}),
			model: new LabelField({model: new LabelFieldModel({type: 'model'}), el: '#model'}),
			year: new LabelField({model: new LabelFieldModel({type: 'year'}), el: '#year'}),
			trim: new LabelStat({model: this.trimModel, el: '#trim'}),
			vin: new LabelStat({model: this.vinModel, el: '#vin'}),
			msrp: new MSRPView({model: this.msrpModel, el: '#msrp'}),
			stockNo: new LabelStat({model: this.stockNoModel, el: '#stockNo'})
		};

		this.view = new LabelView({model: this.label, collection: this.labels}, {fields: this.fields});
		this.pdfControls = new PDFControls({model: this.label, collection: this.labels});
		this.view.render();
		//this.label_images = new Imgs(App.label_images);
		this.label_images_view = new ImgsView({collection: App.label_images});		
		this.logo_view = new LogoView();
		this.logos = new Logos();
		this.logos_view = new LogosView({collection: this.logos});

		//this.label.set('_label_image_collection', this.label_images);
		
		this.get_request_messages = function(tag) {
			return {
				success: $.proxy(function(collection, response, xhr) {
					//console.log(tag + ':Success', collection, response, xhr);
				}, this), 
				error: $.proxy(function(collection, xhr, response) {
					//console.log(tag + ':Error', collection, xhr, response);		
				}, this)
			};
		};
		
				
		this.vehicle_make_view = new VehicleView({model: VehicleMake, el: '#vehicleMakeConfig', type: 'make',
			parent_views: {}});		
		this.vehicle_model_view = new VehicleView({model: VehicleModel, el: '#vehicleModelConfig', type: 'model', 
			parent_views: {make: this.vehicle_make_view}});	
		this.vehicle_year_view = new VehicleView({model: VehicleYear, el: '#vehicleYearConfig', type: 'year', 
			parent_views: {make: this.vehicle_make_view, model: this.vehicle_model_view}});
		this.make_collection = new VehicleType([], {data: App.makes, model: VehicleMake, url: restful.url + 'makes', type: 'make'});
		this.vehicle_make_view.collection = this.make_collection;
		
		this.vehicle_stock_no = new VehicleStat({model: this.stockNoModel, el:'[name=stockNo]'});
		this.vehicle_vin = new VehicleStat({model: this.vinModel, el:'[name=vin]'});
		this.vehicle_msrp = new VehicleStat({model: this.msrpModel, el:'[name=msrp]'});
		this.vehicle_trim = new VehicleStat({model: this.trimModel, el:'[name=trim]'});
				
		//console.log('App', App);
		this.exterior_options_view = new OptionsList({collection: App.exterior_options, input_container: '#exterior-input-container', input: '#exterior-input', add_item: '#add-new-exterior-item', save_button: '#exterior-add-button', el: '#exterior-options'});
		
		this.interior_options_view = new OptionsList({collection: App.interior_options, input_container: '#interior-input-container', input: '#interior-input', add_item: '#add-new-interior-item', save_button: '#interior-add-button', el: '#interior-options'});
		
		this.discount_view = new DiscountList({collection: App.discounts, el: "#discountList"});

		this.discount_controls = new Controls({
			list_view: this.discount_view, 
			input_fields: {
				type: '[name="discountType"]', 
				discount: '[name="discount"]',
				amount: '[name="discountAmount"]'	   
			},
			add_button: '#discount-add-button'
		});
		
		/*		
		this.label_images.fetch({

			success: $.proxy(function() {
				this.label_images_view = new ImgsView({collection: this.label_images});		
				$('.customLabelView').click($.proxy(this.image_click, null, this));
			}, this), 

			error: this.view.error}
		);
		*/
		/*
		this.label_images.on('change:selected', function(model, collection, options) {
			var img_view = new ImgView({model: model});
			this._imgViews[model.cid] = img_view;
			img_view.render(this);
		});
				
		this.image_click = function(generator) {
			var guid = $(this).attr('src');
			generator.label.set('customLabel', guid);
			$('#customLabel').attr('src', guid);
		};
		*/
	};

	$(window).load(function() {
		$('#generator-spinner-overlay').fadeOut();
		$('#generator-page-loader').fadeOut();	
	});
	
	

	var generator = new LabelGenerator();
	
	function get_image_collection() {
		return generator.label_images;
	}
			
	$('[type=file]').change(function() {
		file[$(this).attr('name')] = this.files[0];
	});
	
	
	//
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

});


function debug_server_response(text, model, response, options) {
	//console.log('Model/Collection: ', model);	
	text = (!text) ? 'Response' : text; 
	//console.log(text, response);
	//console.log('Options:', options);
}

function parse_form_data(form) {
	var data = {};
	for (key in form) {
		//console.log(form[key]);
		data[form[key].name] = form[key].value;
	}
	//console.log(data);
	return data;
}