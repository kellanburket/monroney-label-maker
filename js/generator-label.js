var $ = jQuery.noConflict();

	var Label = Backbone.Model.extend({
		defaults: {
			labelColor: '#23498a',
			
			fontStyle: 'normal',
			fontWeight: 'normal',
			_fontWeight: 'normal',
			_fontStyle: 'normal',
			fontFamily: 'sans-serif',
			
			dealershipName: '[Dealership Name]',
			dealershipTagline: '[Tagline]',
			additionalInfo: '[Additional Info]',
			_dealershipName: '[Dealership Name]',
			_dealershipTagline: '[Tagline]',
			_additionalInfo: '[Additional Info]',
			
			_label_image_collection: '',
			
			dealershipLogo: '',
			customlabel: '',	
			
			make: '',
			model: '',
			year: '',
			trim: '',
			vin: '',
			mrsp: '',
			
			optionsInterior: {},
			optionsExterior: {},
			
			discounts: {}
		},
				
		initialize: function() {
			//console.log('Model Initialized');
			this.on('change', function() {
				console.log('Values Have Changed');
			});
		},
		
		get_change: function() {
			var changes = this.changedAttributes()
			for (i in changes) {
				return {key: i, value: changes[i]};
			}
		}
	});
	
	var LabelView = Backbone.View.extend({
		el: '#tag-preview',
			
		initialize: function() {
			console.log('View Initialized');
		},
		
		render: function() {
			console.log('View Rendered');
		
			$('.tag-input[type=text]').on('blur', null, $.proxy(this.setText, null, this, this.model));
			$('[name=fontFamily]').on('change', null, $.proxy(this.setAttr, null, this, this.model));
			$('[name=toggleVisibility]').on('change', null, {view: this}, this.toggleVisibility);
			$('.colorbox').on('click', null, {view: this}, this.setLabelColor);		
			$('[type=fontStyle], [name=fontWeight]').on('change', null, $.proxy(this.setCheckboxAttr, null, this, this.model));
			
			this.model.on('change:labelColor', this.renderLabelColor, this);
			this.model.on('change:fontFamily change:fontWeight change:fontStyle', this.renderTextStyle, this);
			this.model.on('change:dealershipName change:dealershipTagline change:additionalInfo', this.renderText, this);
									
			this.$window = $('#tag-preview-window');
			
			$('#upload-logo').on('click', $.proxy(this.upload_logo, null, this, this.model));
			$('#upload-label').on('click', $.proxy(this.post_label, null, this, this.model));
	
			this.model.on('change:dealershipLogo', function(model, value) {
				console.log('dealershipLogo', value);
				$('#dealershipLogo').attr('src', value);
			});
			//var render_font_weight = _.bind(this.renderTextStyle, 'fontWeight');
			//var render_font_family = _.bind(this.renderTextStyle, 'fontFamily');
			//var render_font_style = _.bind(this.renderTextStyle, 'fontStyle');
			
			//var render_dealership_name = _.bind(this.renderText, 'dealershipName');
			//var render_dealership_tagline = _.bind(this.renderText, 'dealershipTagline');
			//var render_additional_info = _.bind(this.renderText, 'additionalInfo');
			
			//render_font_weight();
			//render_font_family();
			//render_font_style();
			//render_dealership_name();
			//render_dealership_tagline();
			//render_additional_info();
			
			return this;
		},
	
		setLabelColor: function(event) {
			$('.colorbox-wrap').removeClass('selected');
			$(this).parent().addClass('selected');
			event.data.view.model.set("labelColor", $(this).css('background'));
		},
	
		renderLabelColor: function(event) {
			var new_color = this.model.get('labelColor');
			console.log(new_color);
			this.$window.css({background: new_color});		
		},
		
		//this is the object that called
		setAttr: function(view, model) {
			var target_value = $(this).attr('value');			
			var target_name = $(this).attr('name');
			console.log('Target Name: ', target_name);
			console.log('Target Value: ', target_value);
			
			model.set(target_name, target_value);			
		},
	
		setCheckboxAttr: function(view, model) {
			var target_value = $(this).attr('value');			
			var target_name = $(this).attr('name');
			if ($(this).prop('checked')) {
				model.set(target_name, target_value);			
			} else {
				model.set(target_name, model.get('_' + target_name));				
			}				
		},
		
		//text style
		renderTextStyle: function(model, value, options) {
			console.log(value);
			var change = model.get_change();
			$('#tag-preview-window *').css(change.key, value);
		},
		
		//text
		renderText: function(model, value, options) {
			var change = model.get_change();
			$('#' + change.key).text(change.value);
		},
		
		setText: function(view, model) {
			var name = $(this).attr('name');
			var value = $(this).val();
						
			model.set(name, value);
		},

		toggleVisibility: function(event) {
			$('#dealershipLogo, #dealershipName').toggleClass('invisible');
		},
		
		success: function(collection, response, options) {
			console.log("Success");
			//console.log(collection);
			//console.log(response.responseText);
			//console.log(options);
			console.log(response);
			//collection.forEach(function(model) {
				//console.log(model.get('guid'));
			//});
		},
		
		error: function(collection, response, options) {
			console.log("Failure");
			//console.log(collection);
			console.log(response.responseText);
			//console.log(options)
		},
		
		upload_logo: function(view, model) {
			console.log('upload_logo(view, model)', view, model);
			
			var form = get_form_data($(this));
			var img_name = $(this).data('name');
			
			$.when(post_form(form)).done(function(data) {
				if (data.guid) {
					model.set('dealershipLogo', data.guid);
					$('#dealershipLogo').attr('src', data.guid); 
					view.toggleVisibility();
				}
			});
		
		},
		
		post_label: function(view, model) {
			console.log('post_label(view, model)->this', view, model, '->', this);
			var form = get_form_data($(this));
			
			$gallery = $('#' + $(this).data('gallery'));	
			
			$text = $(this).siblings('textarea');
			if ($text.length > 0) {
				form.append($text.attr('name'), $text.val());
			}
			
			$.when(post_form(form)).done(function(data) {
				if (data.guid) {
					//TODO: need to figure out how to handle this
					var i_collection = model.get('_label_image_collection');
					//console.log('Imgs: ', i_collection);
					i_collection.create({guid: data.guid, caption: data.caption});
				}
			});
		}
	});