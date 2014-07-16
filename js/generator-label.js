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
			custom_label_id: '',	
			
			make: '',
			make_id: '',

			model: '',
			model_id: '',
			
			year: '',
			year_id: '',
			
			trim: '',
			vin: '',
			mrsp: '',
			
			optionsInterior: {},
			optionsExterior: {},
			
			discounts: {},
			
			total: 0.00,
		},
				
		initialize: function() {
			this.listenTo(Backbone, "select_featured_image", this.set_featured_image);
		},
		set_featured_image: function(model) {
			this.set('customLabel', model.get('guid'));
		},
		get_total: function() {
			var total = this.get('total');
			return parseFloat(Math.round(total * 100) / 100);
		},
		get_change: function() {
			var changes = this.changedAttributes()
			for (i in changes) {
				return {key: i, value: changes[i]};
			}
		},
		get_msrp: function() {
			return parseFloat(Math.round(this.get('msrp') * 100) / 100);
		}
	});
	
	var PDFControls = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.render();			
		},
		
		render: function() {
			this.$save = $('#save');
			this.$load = $('#load');
			this.$inspect = $('#inspect');
			this.$reset = $('#reset');
			this.$print = $('#print');
		
			this.$save.click($.proxy(this.save_form, this));
			this.$load.click($.proxy(this.load_form, this));
			this.$inspect.click($.proxy(this.inspect_form, this));
			this.$reset.click($.proxy(this.reset_form, this));
			this.$print.click($.proxy(this.print_form, this));
		},
		
		save_form: function() {
			var data = {
				fontStyle: this.model.get('fontStyle'),
				fontWeight: this.model.get('fontWeight'),
				labelColor: this.model.get('labelColor'),
				fontFamily: this.model.get('fontFamily'),
				dealershipName: this.model.get('dealershipName'),
				dealershipTagline: this.model.get('dealershipTagline'),
				dealershipInfo: this.model.get('dealershipInfo'),
				dealershipLogo: this.model.get('dealershipLogo'),
				customLabelId: this.model.get('customLabelId'),
				makeId: this.model.get('makeId'),
				modelId: this.model.get('modelId'),
				yearId: this.model.get('yearId'),
				trim: this.model.get('trim'),
				vin: this.model.get('vin'),
				msrp: this.model.get('msrp'),
				optionIds: this.model.get('optionIds'),
				discountIds: this.model.get('discountds'),
			};
		},
		
		load_form: function() {
			
		},
		
		print_form: function() {},
		
		inspect_form: function() {
			var attributes = _.clone(model.attributes);
		},

		reset_form: function() {
			this.model.clear();
		},
		
		_do_ajax: function(form) {
			return jQuery.ajax(ajax.url, {
				type: 'POST',
				data: form,
				dataType: 'json'
			}).done(function(response) {
				//console.log('post_form:done', response);
			})
			.fail(function(response) {
				//console.log('post_form:fail', response);
			});
		}
	});
	

	
	var LabelField = Backbone.View.extend({
		initialize: function(attrs, opts) {
			//console.log('LabelField', this, attrs, opts);
			this.type = this.model.get('type');
			this.listenTo(Backbone, 'postadd:' + this.type, this.set_field);
			this.listenTo(Backbone, 'selection_changed:' + this.type, this.set_field);
			this.render(attrs.el);
		},

		render: function(el) {
			this.el = el;
			this.$el = $(this.el);
		},
	
		set_field: function(id, name) {
			//console.log("LabelField:set_field(" + this.type + ")", id, name);
			this.model.set({value: name});
			this.$el.text(name);
		}
		
	});
	
	var VIN = Backbone.Model.extend({ 
		defaults: {
			value: '',
		},
		
		initialize: function(attrs, opts) {
			
		},
		validate: function(attrs, opts) {
			console.log('VIN:Validate', attrs, opts);
			if (VIN.length != 16)
				return "Please input a VIN with exactly 16 characters.";
		}
	
	});
	
	var MSRP = Backbone.Model.extend({
		defaults: {
			value: '',
		},
		
		initialize: function(attrs, opts) {
			
		},
		validate: function(attrs, opts) {
			//attrs.value = attrs.value.replace(/,/, '');
			//attrs.value = attrs.value.replace(/\s/, '');
			//attrs.value = parseFloat(attrs.value);			
			//console.log('New Value', attrs.value);
		}
	});
	
	var MSRPView = Backbone.View.extend({
		initialize: function(attrs, opts) {
			//console.log('LabelField', this, attrs, opts);
			this.type = this.model.get('type');
			this.listenTo(this.model, 'change:value', this.set_field);
			this.render(attrs.el);
		},

		render: function(el) {
			this.el = el;
			this.$el = $(this.el);
		},
	
		set_field: function(model, new_value, options) {
			//console.log('LabelStat:setField', new_value, this.$el);
			this.$el.text("$" + parseFloat(Math.round(new_value * 100)/100).toFixed(2));
		}
	});
	
	var LabelStat = Backbone.View.extend({
		initialize: function(attrs, opts) {
			//console.log('LabelField', this, attrs, opts);
			this.type = this.model.get('type');
			this.listenTo(this.model, 'change:value', this.set_field);
			this.render(attrs.el);
		},

		render: function(el) {
			this.el = el;
			this.$el = $(this.el);
		},
	
		set_field: function(model, new_value, options) {
			//console.log('LabelStat:setField', new_value, this.$el);
			this.$el.text(new_value);
		}
	});
	

	var LabelFieldModel = Backbone.Model.extend({
		
		defaults: {
			type: '',
			value: '',
		},
		
		initialize: function(attrs, opts) {
			
		},
	});
	
	
	var LabelOption = Backbone.View.extend({
		tag: 'li',
		class: 'option font-arial px-10',
		initialize: function(attrs) {
			this.render();
		},
		render: function() {
			$tag = $('<' + this.tag + '>', {class: this.class});
			$name = $('<span>', {text: this.model.get('option_name')});
			$value = $('<span>', {class: 'float-right', text: '+ $' + parseFloat(this.model.get('price')).toFixed(2)});
			$tag.append($name, $value);
			
			$('#' + this.model.get('location') + 'Options').prepend($tag);	
			this.el = $('#' + this.model.get('location') + 'Options').children('li')[0];
			console.log(this.el);
		},
		detach_from_view: function(label_view) {
			//console.log(this);
			$(this.el).remove();
		}
	});
	
	var LabelDiscount = Backbone.View.extend({
		tag: 'li',
		class: 'discount font-arial px-10',
		initialize: function() {
			this.render();
		},
		render: function() {
			var symbol_before = (this.model.get('type') == "Value") ? '$' : '';
			var symbol_after = (this.model.get('type') == "Percentage") ? '%' : '';
		
			$tag = $('<' + this.tag + '>', {class: this.class});
			$name = $('<span>', {text: this.model.get('discount')});
			$value = $('<span>', {class: 'float-right', text: "- " + symbol_before + this.model.get('amount').toFixed(2) + symbol_after});
			
			$tag.append($name, $value);

			$('#discounts').prepend($tag);
			this.el = $('#discounts').children('li')[0];
		},
		detach_from_view: function(label_view) {
			console.log(this);
			$(this.el).remove();
		}
	});
	
	
	
	var LabelView = Backbone.View.extend({
		el: '#tag-preview',
			
		initialize: function(attrs, opts) {
			this.fields = opts.fields;
			this.label_options = {interior: {}, exterior: {}};
			this.label_discounts = {};
		},
		
		render: function() {
			////console.log('View Rendered');
			this.$total = $('#total');
			this.$total.val("$0.00");

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
				$('#dealershipLogo').attr('src', value);
			});
			
			this.listenTo(this.model, 'change:customLabel', function(model, value) {
				$('#customLabel').attr('src', value);				
			});
			
			this.listenTo(this.model, 'change:msrp', $.proxy(this.update_total, this, 0, "Value", true));
	
			this.listenTo(Backbone, "add_option", this.add_option);
			this.listenTo(Backbone, "remove_option", this.remove_option);
			
			this.listenTo(Backbone, "add_discount", this.add_discount);
			this.listenTo(Backbone, "remove_discount", this.remove_discount);
			
			return this;
		},
		
		add_option: function(model, price) {
			var old_option = this.label_options[model.get('location')][model.get('option_name')];

			price = (price) ? parseFloat(price).toFixed(2) : 0.00;
			model.set("price", price);
			
			if (old_option) {
				old_option.render();
			} else {
				var new_option = new LabelOption({model: model});
				this.label_options[model.get('location')][model.get('option_name')] = new_option;				
			}

			this.update_total(price, "Value", true);
		},
		
		remove_option: function(model, price) {
			price = (price) ? parseFloat(price).toFixed(2) : 0.00;
			this.label_options[model.get('location')][model.get('option_name')].detach_from_view(this);	
			this.update_total(price, "Value", false);
		},
		
		add_discount: function(model) {
			var old_d = this.label_discounts[model.get('discount')];
			if (old_d) {
				old_d.render();
			} else {
				var new_d = new LabelDiscount({model: model});
				this.label_discounts[model.get('discount')] = new_d;				
			}
			
			var type = model.get('type');
			var amount = model.get('amount');
			this.update_total(amount, type, false);
		},
		
		remove_discount: function(model) {
			this.label_discounts[model.get('discount')].detach_from_view(this);	
			
			var type = model.get('type');
			var amount = model.get('amount');
			this.update_total(amount, type, true);
		},

		update_total: function(amount, type, addValue) {
			amount = parseFloat(Math.round(amount * 100) / 100);
			total = this.model.get_total();
			msrp = this.model.get_msrp();
			
			msrp = (msrp) ? msrp : 0.00;

			if (addValue) {
				if (type == "Value") {
					total += amount;			
				} else if (type == "Percentage") {
					var x = msrp * (amount/100);  
					total += x;							
				}

			} else {
				if (type == "Value") {
					total -= amount;			
				} else if (type == "Percentage") {
					var x = msrp - (msrp * (1 + (amount/100)));  
					total += x;							
				}			
			}
			//console.log("total + msrp", total, msrp);
			this.model.set('total', total);			
			
			this.$total.val("$" + (total + msrp).toFixed(2));			
		},
				
		setLabelColor: function(event) {
			$('.colorbox-wrap').removeClass('selected');
			$(this).parent().addClass('selected');
			event.data.view.model.set("labelColor", $(this).css('background'));
		},
	
		renderLabelColor: function(event) {
			var new_color = this.model.get('labelColor');
			////console.log(new_color);
			$('#tag-preview-footer').css({background: new_color});		
			this.$window.css({background: new_color});		
		},
		
		//this is the object that called
		setAttr: function(view, model) {
			var target_value = $(this).attr('value');			
			var target_name = $(this).attr('name');
			////console.log('Target Name: ', target_name);
			////console.log('Target Value: ', target_value);
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
			////console.log(value);
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
			////console.log("Success");
			////console.log(collection);
			////console.log(response.responseText);
			////console.log(options);
			////console.log(response);
			//collection.forEach(function(model) {
				////console.log(model.get('guid'));
			//});
		},
		
		error: function(collection, response, options) {
			////console.log("Failure");
			////console.log(collection);
			//console.log(response.responseText);
			////console.log(options)
		},
		
		upload_logo: function(view, model) {
			//console.log('upload_logo(view, model)', view, model);
			
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
			//console.log('post_label(view, model)->this', view, model, '->', this);
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
					////console.log('Imgs: ', i_collection);
					i_collection.create({guid: data.guid, caption: data.caption});
				}
			});
		}
	});