define(['jquery', 'underscore', 'backbone', 'label-option-view', 'label-discount-view'], function($, _, Backbone, LabelOption, LabelDiscount) {
	var LabelView = Backbone.View.extend({
		el: '#tag-preview',
			
		initialize: function(attrs, opts) {
			this.collection = attrs.collection;
		},
		
		render: function() {
			this.stopListening();
			$('[name=toggleVisibility]').off("change");
			$('.colorbox').off('click');
			$('[name=fontFamily]').off('change');
			$('[name=msrp]').off('blur');
			$('.branding-option').off("click");
			$('[type=fontStyle], [name=fontWeight]').off('change');
			$('[name="model"], [name="make"], [name="stockNo"], [name="year"], [name="vin"], [name="trim"]').off('blur');

			
			this.listenTo(Backbone, 'modelUpdated', $.proxy(this.model.set_model, this.model));
			this.listenTo(Backbone, 'yearUpdated', $.proxy(this.model.set_year, this.model));
			this.listenTo(Backbone, 'makeUpdated', $.proxy(this.model.set_make, this.model));

			this.listenTo(Backbone, 'msrpUpdated', $.proxy(this.model.set_msrp, this.model));
			this.listenTo(Backbone, 'trimUpdated', $.proxy(this.model.set_trim, this.model));
			this.listenTo(Backbone, 'vinUpdated', $.proxy(this.model.set_vin, this.model));
			this.listenTo(Backbone, 'stockNoUpdated', $.proxy(this.model.set_stock_no, this.model));
			this.listenTo(Backbone, "optionDestroyed", this.remove_option);
			
			this.listenTo(Backbone, "selectImage", $.proxy(this.model.set_image, this.model));
			this.listenTo(Backbone, "makeSelected", $.proxy(this.model.set_make_id, this.model));
			this.listenTo(Backbone, "modelSelected", $.proxy(this.model.set_model_id, this.model));
			this.listenTo(Backbone, "yearSelected", $.proxy(this.model.set_year_id, this.model));
			this.listenTo(this.model, 'change:total', this.update_total);
			this.listenTo(this.model, 'change:msrp', this.update_msrp);
			this.listenTo(this.model, 'change', this.set_field);

			this.listenTo(Backbone, "requestReset", $.proxy(this.model.reset_attributes, this.model));
			

			//console.log("Rendering Model", this.model.get('id'));

			this.label_options = {interior: {}, exterior: {}};
			this.label_discounts = {};

			this.$msrp = $("[name='msrp']");
			this.$msrp.val("$0.00");
			var model = this.model;

			this.$msrp.on('blur', function(event) {
				var val = event.target.value;
				model.set_msrp(val);
			});

			this.$total = $('#total');
			this.$total.val("$0.00");
			
			this.$footer = $('#tag-preview-footer');								
			this.$window = $('#tag-preview-window');
			
			this.$fontFamily = $('[name=fontFamily]');
			this.$fontStyle = $('[name=fontStyle]');
			this.$fontWeight = $('[name=fontWeight]');

			this.$toggleVisibility = $('[name=toggleVisibility]');
			this.$colorbox = $('.colorbox');
			this.$uploadLogo = $('#upload-logo');
			this.$uploadLabel = $('#upload-label');

			this.$dealershipLogo = $('#dealershipLogo');
			this.$dealershipText = $('#dealershipText');

			this.$dealershipName = $('#dealershipName');
			this.$dealershipTagline = $('#dealershipTagline');
			this.$customImage = $('#customImage');
			
			var labelView = this;

			$('.branding-option').on("click", function() {
				if (!$(this).hasClass('selected-option')) {
					labelView.toggle_visibility();
				}
			});
			
			this.model.on('change:labelColor', this.renderLabelColor, this);
			this.renderLabelColor();

			this.listenTo(Backbone, "imageAdded", function(guid, id, clz) {
				//console.log("Image Added", guid, id, clz);
				this.model.set(clz, guid);
				$('#' + clz).attr('src', guid); 
				this.model.set(clz + "Id", id);
			});

			this.model.on('change:fontFamily change:fontWeight change:fontStyle', this.renderTextStyle, this);
			
			this.model.on('change:dealershipName change:dealershipTagline', this.renderText, this);
			this.renderTextByValue({key: 'dealershipTagline', value: this.model.get('dealershipTagline')});
			this.renderTextByValue({key: 'dealershipName', value: this.model.get('dealershipName')});

			/* Deal with images */
			this.model.on('change:dealershipLogo', $.proxy(function(model, value) {
				//console.log("Dealership Logo", model, value);
				
				this.$dealershipLogo.attr('src', value);
				this.$dealershipText.addClass('invisible');
				this.$dealershipLogo.removeClass('invisible');
			}, this));

			this.listenTo(this.model, 'change:customImage', $.proxy(function(model, value) {
				//console.log('change:customImage', this.$customImage, model, value);
				this.$customImage.attr('src', value);				
			}, this));
			
			this.listenTo(Backbone, 'dealershipLogoAdded', this.toggle_visibility);

			$('[name="model"], [name="make"], [name="stockNo"], [name="year"], [name="vin"], [name="trim"]').on('blur', null, $.proxy(this.setText, null, this, this.model));

			this.$fontFamily.on('change', null, $.proxy(this.setAttr, null, this, this.model));

			this.$toggleVisibility.on('change', null, {view: this}, this.toggle_visibility);
			this.$colorbox.on('click', null, {view: this}, this.setLabelColor);		
			$('[type=fontStyle], [name=fontWeight]').on('change', null, $.proxy(this.setCheckboxAttr, null, this, this.model));
			
			Backbone.on("labelSelected", this.replace_model, this);
			
			this.model.on("change:id", this.collection.clone_model, this.collection);
			
			this.listenTo(Backbone, "add_option", this.add_option);
			this.listenTo(Backbone, "remove_option", this.remove_option);
			this.listenTo(Backbone, "optionUpdated", $.proxy(this.model.update_option, this.model));
						
			this.listenTo(Backbone, "add_discount", this.add_discount);
			this.listenTo(Backbone, "remove_discount", this.remove_discount);
			
			this.listenTo(Backbone, 'requestReset', this.reset_options);

			/* load stuff */
			
			this.fetch_options();
			this.fetch_image('customImage');
			this.fetch_image('dealershipLogo');
		

			return this;
		},
		
		set_field: function(model, options) {
			_.each(model.changed, function(el, i, list) {
				//console.log('LabelView:setField', el, i);
				if (i != "msrp") 
					$('#' + i).text(el);
			}, this);
		},

		replace_model: function(model) {
			//console.log('Replace Model', model.get('id'));
			if (this.model.get('id') != model.get('id')) {
				this.model.stopListening();
				this.model = model;			
				this.render();
			}
		},

		reset_options: function() {
			//console.log("Label Options", this.label_options);
			for(var i in this.label_options) {
				for (var j in this.label_options[i]) {
					//console.log("Resetting Options", this.label_options[i][j]); 
					this.label_options[i][j].detach_from_view();					
				}
			}
			
		},
		
		add_option: function(model, price) {
			//console.log('Add Option', model, price, this.label_options);
			var old_option = this.label_options[model.get('location')][model.get('optionName')];		
						
			price = (price) ? parseFloat(price).toFixed(2) : 0.00;
			model.set("price", price);
			
			if (old_option) {
				old_option.render();
			} else {
				var new_option = LabelOption.initialize({model: model});
				this.label_options[model.get('location')][model.get('optionName')] = new_option;				
			}
			
			this.model.add_option(model.get('id'), price);			
		},
		
		remove_option: function(model, price) {
			price = (price) ? parseFloat(price).toFixed(2) : 0.00;
			//console.log("Remove Option", model, price);
			
			this.label_options[model.get('location')][model.get('optionName')].detach_from_view(this);	
			this.model.remove_option(model.get('id'), price);
		},
		
		add_discount: function(model) {
			var old_d = this.label_discounts[model.get('discount')];
			if (old_d) {
				old_d.render();
			} else {
				var new_d = LabelDiscount.initialize({model: model});
				this.label_discounts[model.get('discount')] = new_d;				
			}
		},
		
		remove_discount: function(model) {
			this.label_discounts[model.get('discount')].detach_from_view(this);	
		},

		update_total: function() {
			var total = this.model.get("total").toFixed(2);
			//console.log("Update Total", total);
			total = total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
			//console.log("Update Total", "$" + total);					
			this.$total.val("$" + total);			
		},

		update_msrp: function(model, value, options) {
			value = parseFloat(value).toFixed(2);
			value = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
			//console.log("Update MSRP", value);

			$("#msrp").text("$" + value);		
			this.$msrp.val("$" + value);		

		},
				
		setLabelColor: function(event) {
			$('.colorbox-wrap').removeClass('selected');
			$(this).parent().addClass('selected');
			event.data.view.model.set("labelColor", $(this).attr('id'));
		},
	
		renderLabelColor: function(event) {
			var new_color = this.model.get('labelColor');
			this.$footer.css({background: new_color});		
			this.$window.css({background: new_color});		
		},
		
		
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
			this.renderTextByValue(model.get_change());
		},

		renderTextByValue: function(change) {
			//console.log("renderTextByValue", change);
			$el = $('[name="' + change.key + '"]');
			var tag = $el.prop("tagName");
			//console.log("Render Text", change.key, change.value, tag);

			if (tag.match(/INPUT/i)) {
				$el.val(change.value);
			} else {
				$el.text(change.value);
			}
			$('#' + change.key).text(change.value);

		},
		
		setText: function(view, model) {
			var name = $(this).attr('name');
			var value = $(this).val();
						
			model.set(name, value);
		},

		toggle_visibility: function(event) {
			$('#dealershipLogo, #dealershipText').toggleClass('invisible');
			$('.branding-option').toggleClass('selected-option');	
			$('.branding-configuration').toggleClass('invisible');
			var logoIsDisplayed = this.model.get('displayLogo');
			this.model.set('displayLogo', logoIsDisplayed ? false : true);		
		},
		
		fetch_image: function(name) {
			var guid = this.model.get(name);
			var id = this.model.get(name + 'Id');
			var name_ucfirst = name.charAt(0).toUpperCase() + name.substr(1, name.length);
				
			//console.log('Fetch ' + name, guid, id, name_ucfirst);

			if (!guid) {
				if (id) {
					this.listenToOnce(Backbone, 'return' + name_ucfirst, $.proxy(function(img) {
					//console.log(name + " Returned", img);					
						this.model.set(name, img.get('guid'));
					}, this));
					Backbone.trigger('request' + name_ucfirst, id);
				}
			} else {
				$('#' + name).attr('src', guid);
			}		
		},
						
		fetch_options: function() {
			var ids = this.model.get('optionIds');
			var prices = this.model.get('optionPrices');
			/*
			if (option_ids.length > 0) {
				this.listenToOnce(Backbone, 'returnOptions', $.proxy(function(opts) {
				//console.log('Options Returned', opts);					
					for (var o in opts) {
						o.get('name');
					}
				}, this));
			}
			*/
			Backbone.trigger('requestOptions', ids, prices);
		},
	});

	var initialize = function(attrs, opts) {
		return new LabelView(attrs, opts);
	};
	
	return {initialize: initialize};
});	
	
