var file = {};

function get_form_data($target) {
	console.log('get_form_data:file', file);
	console.log('get_form_data:target', $target);
	console.log('get_form_data:target.data', $target.data());

	var form = new FormData();
	for(var i in file) {
		console.log('get_form_data:file(key, value)', i, file[i]);
		form.append(i, file[i]);	
	}

	form.append('action', ajax.action);

	console.log('get_form:form', form);
	
	_.each($target.data(), function(value, key, list) {
		console.log('get_form_data:$target.data(key, value)', key, value);
		form.append(key, value);
	});

	console.log('get_form:form', form);
	return form;
}

function post_form(form) {
	console.log('post_form');			
	return jQuery.ajax(ajax.url, {
		type: 'POST',
		data: form,
		dataType: 'json',
		processData: false,
		contentType: false
	}).done(function(response) {
		console.log('post_form:done', response);
	})
	.fail(function(response) {
		console.log('post_form:fail', response);
	});
}

jQuery(document).ready(function($) {
	
	function LabelGenerator() {
		
		this.label = new Label();
		this.view = new LabelView({model: this.label});
		
		this.view.render();
		this.label_images = new Imgs();
		this.label.set('_label_image_collection', this.label_images);
		
		this.vehicle = new Vehicle();
		this.vehicle_models = new VehicleAttrs('', {model: VehicleModel, url: restful.url + 'models'});
		this.vehicle_makes = new VehicleAttrs('', {model: VehicleMake, url: restful.url + 'makes'});
		this.vehicle_years = new VehicleAttrs('', {model: VehicleYear, url: restful.url + 'years'});
				
		this.vehicle_model_view = new VehicleView({model: this.vehicle, collection: this.vehicle_models, el: '#vehicleModelConfig'});		
		this.vehicle_make_view = new VehicleView({model: this.vehicle, collection: this.vehicle_makes, el: '#vehicleMakeConfig'});		
		this.vehicle_year_view = new VehicleView({model: this.vehicle, collection: this.vehicle_years, el: '#vehicleYearConfig'});		

		this.label_images.fetch({
			success: $.proxy(function() {
				this.label_images_view = new ImgsView({collection: this.label_images});		
				//console.log($('.customLabelView'));
				$('.customLabelView').click($.proxy(this.image_click, null, this));
			}, this), 
			error: this.view.error}
		);
		
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
	};

	var generator = new LabelGenerator();
	
	function get_image_collection() {
		return generator.label_images;
	}

	//debug_server_response("Handling Server Add", model, response, options);		
	
	//console.log(xhr);
	//console.log(generator.label_images);
	
			
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
		
		$('.tag-frame').hide();
		$('#tag-frame-' + id).show();
		
		$(this).addClass('active');
		$(this).removeClass('inactive');
	});

});


function debug_server_response(text, model, response, options) {
	console.log('Model/Collection: ', model);	
	text = (!text) ? 'Response' : text; 
	console.log(text, response);
	console.log('Options:', options);
}

function parse_form_data(form) {
	var data = {};
	for (key in form) {
		console.log(form[key]);
		data[form[key].name] = form[key].value;
	}
	console.log(data);
	return data;
}