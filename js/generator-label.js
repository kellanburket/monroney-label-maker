var $ = jQuery.noConflict();

	Backbone.ExtendedCollection = Backbone.Collection.extend({
		create: function(attributes, options) {						
 		//console.log("New Model", this, attributes, options);
 			options = (!options) ? {} : options;
			if (!attributes) {
				return false;
			}
			options['url'] = this.url;
			
			var new_options = {}
			var that = this;
			var new_model = new this.model(attributes, options);
				
			new_options['success'] = function(collection, response, xhr) {
				var json_response = $.parseJSON(xhr.responseText);
					if (json_response.success = true) {
						//console.log('Success', json_response);
						that.add(new_model);
					} else if(json_response.message = "Already Added") {
						//console.log("Already Added", json_response);
					}
				};
				
			new_options['error'] = function(xhr, response, error) {
			//console.log('Error', xhr.responseText);
			};
				
			new_options['data'] = {};
				
			for (i in attributes) {
				new_options['data'][i] = new_model.get(i);	
			}
			
			new_options['dataType'] = 'json';
			new_options['processData'] = true;
	
			for (i in options) {
				new_options[i] = options[i];
			}
			//console.log("OptionSync", new_model, new_options);
			return Backbone.sync('create', new_model, new_options);
		},
		
		parse: function(snake, options) {
			var camel = this.snakeToCamelCase(snake);
			
			var camels = [];
			_.each(camel, function(el, i, li) {
				camels.push(el);
			}, this);
			//console.log('Parse', snake, camel, camels, options);
			return camels;
		},
		
		snakeToCamelCase: function (snakes) {
    		var camels = []
			//console.log('SNAKES', snakes);
			for (var i in snakes) {
				camels.push(this._recursiveSnakes(snakes[i]));
			}
			return camels;
		},
		
		_recursiveSnakes: function(snakes) {
			if (typeof snakes == 'string') {
				//console.log('SnakeCamel:string', snakes);
				
				if (snakes.match(/.*\.[a-zA-Z0-9]{3,4}$/)) {
					return snakes;				
				}
				
				return snakes.toLowerCase().replace(/_(.)/g, function(match, horse) {
					return horse.toUpperCase();
				});
			} else if (typeof snakes == 'object') {
				camel = {};
				for (var key in snakes) {
					if (snakes[key] != null) {
						//console.log('SnakeCamel:object', key, snakes[key]);
						camel[this._recursiveSnakes(key)] = this._recursiveSnakes(snakes[key]);
					}
				}
				return camel;				
			} else if (typeof snakes == 'number') {
				//console.log('SnakeCamel:number', snakes);

				return snakes;
			} else {
				//return null;
				//console.log('SnakeCamel:undefined', snakes);
			}
		}
				
	});


	Backbone.Dialog = Backbone.View.extend({
		template: $('#dialogTemplate').html(),
		initialize: function(attrs, opts) {
			//console.log('BackboneDialog', this.template);
			attrs = attrs || {};
			attrs['submitClass'] = attrs['submitClass'] + " tag-button" || "tag-button";  
			attrs['class'] = attrs['class'] + " dialogForm" || "dialogForm";  

			this.render(attrs, opts);			
		},
		
		render: function(context, opts) {
			Handlebars.registerHelper('list', function(items, options) {
				var out = '';
				_.each(items, function(el, i, li) {
					out += '<label class="tag-label" for="' + el.field.attr('name') + '">' + el.label + '</label>';
					//console.log(el.field.attr('name'), el.field.html());
					$div = $('<div>');
					$div.append(el.field);
					out += $div.html();
				}, this);
				//console.log('HandlebarsTemplateHelper:list', items, options, out);
				return out;			
			});
			//console.log('Rendering Dialog');
			var source = Handlebars.compile(this.template);
			var html = source(context);
			Modal.setModalProperties({overflow: "hidden", margin: "auto"});
			Modal.openDomDocument(html);
			
			$('#' + context.submitId).click(function(event) {
				var f_data_obj = $('#' + context.id).serializeArray();
				event.preventDefault();
				event.stopPropagation();

				var post_data = {};
				
				var allFieldsFilledIn = true;
								
				for(var i in f_data_obj) {
					if (!f_data_obj[i].value) {
						$thing = $('[name="' + f_data_obj[i].name + '"]');
						
						if ($thing.hasClass('nonmandatory')) {
							continue;
						}
						//console.log(f_data_obj[i].name + ' not filled in.');
						$thing.animate({backgroundColor: '#bf2026'}, {duration: 600});
						$thing.click(function() {
							$(this).css('backgroundColor', '#ffffff');
						});
						allFieldsFilledIn = false;
					} else {
						post_data[f_data_obj[i].name] = f_data_obj[i].value;
					//console.log(f_data_obj[i].name, post_data[f_data_obj[i].name]);
					}
				}
	
				if (!allFieldsFilledIn) {
				//console.log('Not all fields filled in');
					return false; 
				} else {
					//console.log(opts.callback, opts.context, post_data);
					opts.callback.call(opts.context, post_data);
				}
			});
			
		}	
	});	
	
	var PDFControls = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.collection = attrs.collection;
			this.render();			
		},

		render: function() {
			this.scale = .7;
			this.userId = 0;
			
			this.$save = $('#save-label');
			this.$load = $('#load-label');
			this.$inspect = $('#inspect-label');
			this.$reset = $('#reset-label');
			this.$print = $('#print-label');
			this.$login = $('#login-label');
			this.$signup = $('#signup-label');
			
			this.$login.click($.proxy(this.log_in, this));
			this.$signup.click($.proxy(this.sign_up, this));
			this.$save.click($.proxy(this.save_form, this));
			this.$load.click($.proxy(this.load_form, this));
			this.$inspect.click($.proxy(this.inspect_form, this));
			this.$reset.click($.proxy(this.reset_form, this));
			this.$print.click($.proxy(this.print_form, this));

			this.listenTo(Backbone, "labelSelected", this.replace_model);
			this.listenTo(Backbone, "showFailMessage", this.show_fail_message);
			
			$('.tooltip').parent().hover(function(){ 
				$(this).children('.tooltip').css('visibility', 'visible'); 
			}, function(){
				$(this).children('.tooltip').css('visibility', 'none'); 
			});
		},
		
		replace_model: function(model) {
			if (model) {
				this.model = model;
				this.render();
			}			
		},
		
		/**
		**		On Save Click
		**/
		save_form: function() {
			if (!this.validate_user()) return false;
			
			$name = $('<input>', {type: 'text', class: 'tag-input nonmandatory', name: 'labelName'});
			$select = this.get_label_select(this.model.get('id'), false); 	

			var dialog = new Backbone.Dialog(
				{fields: 
					[
						{label: 'Save new label:', field: $name},
						{label: 'Save as label:', field: $select} 
					],
					id: 'saveForm', 
					submitText: 'Save',
					submitId: 'save-button'
				},
				{callback: this.on_user_save, context: this}
			);


		},
		
		_gather_save_data: function() {
			
			var data = {
					//font_style: this.model.get('fontStyle'),
					//font_weight: this.model.get('fontWeight'),
					label_color: this.model.get('labelColor'),
					//font_family: this.model.get('fontFamily'),
					dealership_name: this.model.get('dealershipName'),
					dealership_tagline: this.model.get('dealershipTagline'),
					//dealership_info: this.model.get('dealershipInfo'),
					dealership_logo_id: this.model.get('dealershipLogoId'),
					custom_label_id: this.model.get('customLabelId'),
					option_ids: this.model.get('optionIds'),
					option_prices: this.model.get('optionPrices'),
					//discount_ids: this.model.get('discount_ids')
					user_id: this.model.get('userId'),
					id: (parseInt(this.model.get('id')) > 0) ? this.model.get('id') : null,
					name: this.model.get('name')
				};
		//console.log('Gather Data', this.model, data);

			return data;		
		},

		on_user_save: function(data) {
			var data = _.extend(this._gather_save_data(), {name: data.labelName});
			//console.log('save_form', data);
			var request;
			var id = $('#label-selector option:selected').val();
			
			if (id > 0) {
				request = 'PUT';	
			} else {
				request = 'POST';
			}
			
			this._do_ajax(data, request, restful.url + 'labels', this.on_save_successful);			
		},

		on_save_successful: function(data) {
			Modal.displayMessage('Form saved.', 'success-message align-center');			

			if (data.method.match(/post/i)) {
				Backbone.trigger('modelSavedAs', data.id);
			}

			this.model.set('id', data.id);
			this.model.set('name', data.name);
		},
		
		get_label_select: function(selected_id, appendAddNew) {
			appendAddNew = appendAddNew || true;
			selected_id = selected_id || 0;

			$select = $('<select>', {id: 'label-selector', class: 'tag-select', style: 'width: 250px; display: block; margin: 0 auto;'});			
			
			if (appendAddNew) {
				$newLabel = $('<option>', {text: 'New Label', id: 'new_selection', value: '0'});
				$select.append($newLabel);	
			}
			var labels = this.collection.models;
			//console.log("get Label Select", labels);
			
			for (var l in labels) {
				var name = labels[l].get('name');
				var label_id = labels[l].get('id');
				if (name) {
					var vals = {text: name, value: label_id};
					if (selected_id == label_id) {
						$select.append('<option selected value="' + label_id + '">' + name + '</option>');
						//$select.val(label_id);
					//console.log("Get Label Select", $select, selected_id, label_id);
					} else {
						$select.append($('<option>', vals));
					}
				}
			}
			return $select;
			
		},
		
		/**
		**		On Load Click
		**/		
		load_form: function() {
			if (!this.validate_user()) return false;

			$select = this.get_label_select();
			var dialog = new Backbone.Dialog({
				fields: [{label: 'Please Select a Form to Load', field: $select, id: 'label-selector'}], 
				id: 'loadForm', 
				class: 'dialogForm',
				submitText: 'Load',
				submitClass: 'tag-button',
				submitId: 'load-button'
			},
				{callback: $.proxy(this.on_label_load, this, $select), context: this}
			);
		},
		
		on_label_load: function($select) {
			$selected = $select.children(':selected');
			var name = $selected.text(); 
			var id = $selected.val();
		//console.log('on_label_load', $select, $selected, id, name);
			Modal.close();	
			if (id <= 0) {
				this.model.set('id', id);
				this.model.set('name', name);
			} else {
				var model = this.collection.findWhere({id: id});
				//console.log('loading label:', model, this.collection);
				Backbone.trigger('labelSelected', model); 
			}		
		},
		
		print_form: function() {
			var data = this._gather_data();
			data['callback'] = 'generate_pdf_label'; 
			this._do_ajax(data, 'POST', ajax.url, this.print_pdf);			
		},
		
		inspect_form: function() {
			var data = this._gather_data();
			data['callback'] = 'generate_pdf_label'; 
			this._do_ajax(data, 'POST', ajax.url, this.show_pdf);			
		},

		reset_form: function() {
			Backbone.trigger('requestReset');
		},
		
		_gather_data: function() {
			var tree = Array();
			tree.push(this.get_sizing($('#tag-preview-window')));
			var data = {
				scale: this.scale,
				root_element: JSON.stringify(this.get_sizing($('#tag-preview-window'))),
				elements: JSON.stringify(this.get_elements($('#tag-preview-window'), tree)),
			};
			
			return data;
		},
		
		get_elements: function($root, tree) {	
			var controls = this;					
			$root.children().each(function() {
				if ($(this).is(":visible")) {
					var branch = controls.get_sizing($(this));
					tree.push(branch);
					controls.get_elements($(this), tree);				
				}
			});
			return tree;
		},
		
		
		get_sizing: function($thing) {
		return {	width: $thing.css('width'), 
					height: $thing.css('height'), 
					padding: $thing.css('padding'),
					margin: $thing.css('margin'),
					background: $thing.css('background-color'),
					children: this.get_children_ids($thing),
					parent: this.get_parent_id($thing),
					border: this.get_border($thing),
					position: $thing.css('position'),
					tag: $thing.prop('tagName'),
					id: $thing.attr('id'),
					display: $thing.css('display'),
					siblings: this.get_siblings($thing),
					text: this.get_text($thing),
					color: $thing.css('color'),
					fontsize: $thing.css('font-size'),
					fontfamily: $thing.css('font-family'),
					fontweight: $thing.css('font-weight'),
					fontstyle: $thing.css('font-style'),
					textalign: $thing.css('text-align'),
					float: $thing.css('float'),
					top: $thing.css('top'),
					right: $thing.css('right'),
					bottom: $thing.css('bottom'),
					left: $thing.css('left'),
					image: $thing.attr('src'),
					zindex: $thing.css('z-index'),
					verticalalign: $thing.css('vertical-align')
				};
		},
	
		get_border: function($thing) {
			var o = {
			top: $thing.css('border-top'),
			right: $thing.css('border-right'),
			bottom: $thing.css('border-bottom'),
			left: $thing.css('border-left')
			}
			return o;
		},
		
		get_text: function($thing) {
			if ($thing.val()) return $thing.val().trim(); 
			else return $thing.clone().children().remove().end().text().trim();
		},

		get_siblings: function($thing) {
			var siblings = Array();
			
			$thing.parent().children().each(function() {
				if ($(this).attr('id') == $thing.attr('id')) {
					return false;
				}
			//console.log('IDS(' + $thing.attr('id') + ')', $(this).attr('id'));
				siblings.push($(this).attr('id'));
			});
			return siblings;
		},
		
		get_parent_id: function($child) {
			return $child.parent().attr('id');
		},
		
		get_children_ids: function($parent) {
			var ids = Array();
			$parent.children().each(function() {
				ids.push($(this).attr('id'));				
			});
			return ids;
		},
		
		print_pdf: function(data) {
			window.location = data.pdf;
			//var pdf = window.open(data.pdf);
			//pdf.print();
		},
		
		show_pdf: function(data) {
		//console.log('Canvas', data);
			//PDFJS.disableWorker = true;
			PDFJS.workerSrc = pdfjs_ext.url + 'generic/build/pdf.worker.js';
			PDFJS.getDocument(data.pdf).then(function(pdf) {
				// Using promise to fetch the page
			//console.log('Canvas:getDocument', pdf);
				
				pdf.getPage(1).then(function(page) {
					var scale = 1.333;
					var viewport = page.getViewport(scale);
					//var canvas = $('<canvas', {id: 'pdfviewer'});
					//$('#modal-content').append(canvas);
					Modal.replaceContent('canvas', {id: 'pdfviewer', style: 'display:none'});
					
					var canvas = document.getElementById('pdfviewer');
					var context = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					var renderContext = {
						canvasContext: context,
						viewport: viewport
					};
					page.render(renderContext);
					//console.log("Canvas:", data.height, canvas.width);
					Modal.setContentProperties({overflow: "hidden"});
					Modal.setModalProperties({width: data.width, height: data.height, maxHeight: window.innerHeight - 100, overflowY: 'auto'});					
					$('#pdfviewer').show();

			  });
			})
			//src: viewer.url + data.pdf;
			//var path = {src: src, id: "viewer", width: 400, height: 1000};
			
		},
		
		/** 
		**	Called when user clicks on log in button
		**/
		log_in: function() {
			$email = $('<input>', {type: 'text', value: "kellan.burket@gmail.com", class: 'tag-input', name: 'loginEmail'});
			$passw = $('<input>', {type: 'password', value: "gaiden", class: 'tag-input', name: 'loginPassword'});
			
			var dialog = new Backbone.Dialog(
				{	fields: 
					[
						{label: 'Email', field: $email}, 
						{label: 'Enter a Password', field: $passw}, 
					],
					id: 'loginForm', 
					submitText: 'Log In',
					submitId: 'loginButton'
				},
				
				{
					callback: $.proxy(function(data) {
							this._do_ajax(data, 'GET', restful.url + '/users', this.on_successful_log_user_in);
						}, this),
					context: this
				}
			);
		},

		on_successful_log_user_in: function(data) {
			this._init_user(data);
			$doc = $('<div>');
			$head = $('<h3>', {text: 'Welcome back, ' + data.name + '. Please select a label:', class: 'success-message align-center'});			

			$select = this.get_label_select(); 

			$ok = $('<button>', {text: 'OK', class: 'tag-button ok-button', style: 'margin-bottom: 50px'});
			$doc.append($head, $select, $ok);
			
			Modal.openDomDocument($doc);
			$options = [];
						
			$ok.one('click', $.proxy(this.on_label_load, this, $select));
		},

		/** 
		**	Initializes the user element
		**	TRIGGERS--Backbone: userLoggedIn
		**/		

		_init_user: function(data) {
			this.model.set('userId', data.id);
			this.model.set('userName', data.name);		
			this.collection.userId = data.id;
			this.collection.userName = data.name;
			var user = new User(data);
			//var coll = this.collection.parse(data.labelgen_labels);		
			this.collection = user.get('labels');
			this.model.set('user', user);
			this.hide_login_links();
			Backbone.trigger('userLoggedIn', user);
		},
		
		validate_user: function() {
			console.log('Validate User', this);
			if (this.model.get('userId') > 0) {
				return true;
			} else {
				this.show_fail_message('You must be logged in to perform this action!');
				return false;
			}
		},

		/** 
		**	Maniupulate the visibility of login links at the top of the form
		**/		
		
		hide_login_links: function() {
			$('.login-txt').addClass('invisible');
			$('.welcome-user-text').removeClass('invisible').text('Welcome ' + this.model.get('userName') + '!');			
		},
		
		show_login_links: function() {
			$('.login-txt').removeClass('invisible');
		},
		
		/** 
		**	Called when user clicks on signup button
		**/
		sign_up: function() {
			$name = $('<input>', {type: 'text', class: 'tag-input', name: 'signupName'});
			$email = $('<input>', {type: 'text', class: 'tag-input', name: 'signupEmail'});
			$passw = $('<input>', {type: 'password', class: 'tag-input', name: 'signupPassword'});
			$retype = $('<input>', {type: 'password', class: 'tag-input', name: 'signupPasswordRetype'});
			//console.log('User Sign Up');
			
			var dialog = new Backbone.Dialog(
				{fields: 
					[
						{label: 'Full Name', field: $name}, 
						{label: 'Email', field: $email}, 
						{label: 'Enter a Password', field: $passw}, 
						{label: 'Retype Password', field: $retype}, 
					],
					id: 'signupForm', 
					submitText: 'Sign Up',
					submitId: 'signup-button'
				},
				{	
					callback: $.proxy(function(data) {
							//console.log('on_user_signup', data);
							if(data.signupPassword != data.signupPasswordRetype) {
								$('[name="signupPasswordRetype"]').animate({backgroundColor: '#bf2026'}, {duration: 600});
								$('[name="signupPasswordRetype"]').val('');
							} else {
								this._do_ajax(data, 'POST', restful.url + '/users', this.on_successful_sign_user_up);
							}
						}, this), 
					context: this
				}
			);
		},
		
		on_successful_sign_user_up: function(data) {
			Modal.displayMessage('Congratulations, ' + data.name + '. <p>You have been signed up to use the Monroney Label Generator. You can login again using your password and the email you registered with. Thank you for doing business with us.</p>', 'success-message align-center');			
			this._init_user(data);			
		},
		
		show_fail_message: function(message) {
			Modal.displayMessage(message, 'fail-message');		
		},
		
		show_dialog: function(tag, options, modal_animation) {
			modal = Modal.open(tag, options, modal_animation);		
		},
				
		_do_ajax: function(data, method, url, callback) {
			data['action'] = ajax.action;
			Modal.showLoader();
			//Modal.open('img', {src: modal_ext.url + 'loader.gif', class: 'snakeskin-loader'}, {height: 'auto', width: 'auto'});
			console.log('Method', method, data, url);
			if (method.match(/put/i)) {
				var contentType = 'application/x-www-form-urlencoded';	
				var controls = this;
				console.log('ajax.url', data);
				return $.ajax(url, {
					type: method,
					data: data,
					dataType: 'json',
					contentType: contentType,
				}).done(function(response) {
					console.log('post_form:done', response, response.message);
					if (response.success == true) {
						callback.call(controls, response);
					} else {
						controls.show_fail_message(response.message);
					}
					//var response = $.parseJSON(response);
				})
				.fail(function(response) {
					controls.show_fail_message("Something went technically wrong! If the problem persists, please contact the site administartor");
				//console.log('post_form:fail', response.responseText);
				});
			
			
			} else {
				var controls = this;
				console.log('ajax.url', data);
				return $.ajax(url, {
					type: method,
					data: data,
					dataType: 'json'
				}).done(function(response) {
					console.log('post_form:done', response); //response.message);
					if (response.success == true) {
						callback.call(controls, response);
					} else {
						controls.show_fail_message(response.message);
					}
					//var response = $.parseJSON(response);
				})
				.fail(function(response) {
					controls.show_fail_message("Something went technically wrong! If the problem persists, please contact the site administartor");
				//console.log('post_form:fail', response.responseText);
				});
			}
			
			
		}
	});

	var LabelOption = Backbone.View.extend({
		tag: 'li',
		class: 'option font-arial px-10',
		
		initialize: function(attrs) {
			this.render();
		},
		
		render: function() {
			var option_name = this.model.get('option_name');
			$tag = $('<' + this.tag + '>', {class: this.class, id: 'option_' + option_name.replace(/\s/, '_')});
			$name = $('<span>', {text: option_name, class: 'basal-font', id: 'option_' + option_name.replace(/\s/, '_') + '_name'});
			$value = $('<span>', {class: 'float-right basal-font', text: '+ $' + parseFloat(this.model.get('price')).toFixed(2), id: 'option_' + option_name.replace(/\s/, '_') + '_value'});
			$tag.append($name, $value);
			
			$('#' + this.model.get('location') + 'Options').prepend($tag);	
			this.el = $('#' + this.model.get('location') + 'Options').children('li')[0];
		//console.log(this.el);
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
			var discount_name = this.model.get('discount');
			$tag = $('<' + this.tag + '>', {class: this.class, id: 'discount_' + discount_name.replace(/\s/, '_')});
			$name = $('<span>', {class: 'basal-font', text: discount_name, id: 'discount_' + discount_name.replace(/\s/, '_') + '_name'});
			$value = $('<span>', {class: 'float-right basal-font', text: "- " + symbol_before + this.model.get('amount').toFixed(2) + symbol_after, id: 'discount_' + discount_name.replace(/\s/, '_') + '_value'});
			
			$tag.append($name, $value);

			$('#discounts').prepend($tag);
			this.el = $('#discounts').children('li')[0];
		},
		detach_from_view: function(label_view) {
		//console.log(this);
			$(this.el).remove();
		}
	});
	
	var Label = Backbone.Model.extend({
		defaults: {
			user: null,
			userId: 0,
			id: null,
			name: null,
			labelColor: '#23498a',
			stockNo: '',
			
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
			
			dealershipLogo: null,
			dealershipLogoId: null,
			customLabel: null,
			customLabelId: null,	
			
			make: '',
			make_id: '',

			model: '',
			model_id: '',
			
			year: new Date().getFullYear(),
			year_id: '',
			
			trim: '',
			vin: '',
			mrsp: '',
			
			optionsInterior: [],
			optionsExterior: [],
			
			optionIds: [],
			discount_ids: [],
			optionPrices: {},
			
			discounts: [],
			
			total: 0.00,
		},
				
		initialize: function(attrs, opts) {
		//console.log('New Label', attrs, opts);
			this.listenTo(Backbone, 'modelUpdated', this.set_model);
			this.listenTo(Backbone, 'yearUpdated', this.set_year);
			this.listenTo(Backbone, 'makeUpdated', this.set_make);

			this.listenTo(Backbone, 'msrpUpdated', this.set_msrp);
			this.listenTo(Backbone, 'trimUpdated', this.set_trim);
			this.listenTo(Backbone, 'vinUpdated', this.set_vin);
			this.listenTo(Backbone, 'stockNoUpdated', this.set_stock_no);
			
			
			this.listenTo(Backbone, "selectImage", this.set_image);
			this.listenTo(Backbone, "makeSelected", this.set_make_id);
			this.listenTo(Backbone, "modelSelected", this.set_model_id);
			this.listenTo(Backbone, "yearSelected", this.set_year_id);
			this.listenTo(Backbone, "requestReset", this.reset_attributes);

			this.on("change:user", function(model, name) {
				model.previous("user").stopListening();
			});
		},

		set_all_attributes: function() {
			for(var name in this.attributes) {
				this.set(name, this.attributes[name]);
			}
		},

		set_image: function(clz, model) {
			var id = model.get('id');
			var guid = model.get('guid');
			
			console.log('Set Featured Image', model, id);
			this.set(clz, guid);
			this.set(clz + 'Id', id);
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

		add_option: function(id, price) {
			this.attributes.optionIds.push(id);
			this.attributes.optionPrices[id] = price;
		},

		remove_option: function(id, price) {
			var index = this.attributes.optionIds.indexOf(id);		
			this.attributes.optionIds.splice(index, 1);
			delete this.attributes.optionPrices[id];		
		},
		
		set_model_id: function(id) {
			this.set('model_id', id);
		},

		set_make_id: function(id) {
			this.set('make_id', id);
		},

		set_year_id: function(id) {
			this.set('year_id', id);
		},

		set_model: function(name) {
		//console.log('Set Model', name);
			this.set('model', name);
		},

		set_make: function(name) {
		//console.log('Set Make', name);
			this.set('make', name);
		},

		set_year: function(year) {
		//console.log('Set Year', year);
			this.set('year', year);
		},

		set_msrp: function(msrp) {
		//console.log('Set MSRP', msrp);
			this.set('msrp', parseFloat(Math.round(msrp * 100)/100).toFixed(2));
		},

		set_vin: function(vin) {
		//console.log('Set VIN', vin);
			this.set('vin', vin);
		},

		set_stock_no: function(stock_no) {
		//console.log('Set Stock No', stock_no);
			this.set('stockNo', stock_no);
		},

		set_trim: function(trim) {
		//console.log('Set Trim', trim);
			this.set('trim', trim);
		},

		get_msrp: function() {
			return parseFloat(Math.round(this.get('msrp') * 100) / 100);
		},
		
		reset_attributes: function() {
			Backbone.trigger('labelReset');
			for(var name in this.attributes) {
				this.set(name, '');
			}
		},
	});	
	
	var Labels = Backbone.ExtendedCollection.extend({
		model: Label,
		
		initialize: function(models, options) {
			this.userId = null;
			this.userName = null;
		},
		
		clone_model: function(model, value, opts) {
			var changes = model.changedAttributes();			
		//console.log('Clone Model', changes, model, value);
			
		},

		url: function() {
			var q_string = ''
			
			if (this.userId) {
				q_string = '?user_id=' + this.userId;
			}
			
			return 'api/labels' + q_string;
		}
	})
	
	var LabelView = Backbone.View.extend({
		el: '#tag-preview',
			
		initialize: function(attrs, opts) {

			this.collection = attrs.collection;
			this.label_options = {interior: {}, exterior: {}};
			this.label_discounts = {};
		},
		
		render: function() {
			this.stopListening();

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
			this.$customLabel = $('#customLabel');
			
			this.model.on('change:labelColor', this.renderLabelColor, this);
			this.renderLabelColor();
			

			this.listenTo(Backbone, "imageAdded", function(guid, id, clz) {
				this.model.set(clz, guid);
				$('#' + clz).attr('src', guid); 
				this.model.set(clz + "Id", id);
			});

			this.listenTo(Backbone, 'userLoggedIn', this.enable_dropzones);

			this.model.on('change:fontFamily change:fontWeight change:fontStyle', this.renderTextStyle, this);
			
			this.model.on('change:dealershipName change:dealershipTagline change:additionalInfo', this.renderText, this);

			/* Deal with images */
			this.model.on('change:dealershipLogo', $.proxy(function(model, value) {
				console.log("Dealership Logo", model, value);
				this.$dealershipLogo.attr('src', value);
				this.$dealershipText.addClass('invisible');
				this.$dealershipLogo.removeClass('invisible');
			}, this));

			this.listenTo(this.model, 'change:customLabel', $.proxy(function(model, value) {
				this.$customLabel.attr('src', value);				
			}, this));
			
			this.listenTo(Backbone, 'dealershipLogoAdded', this.toggle_visibility);

			this.listenTo(this.model, 'change:msrp', $.proxy(this.update_total, this, 0, "Value", true));

			$('.tag-input[type=text]').on('blur', null, $.proxy(this.setText, null, this, this.model));
			this.$fontFamily.on('change', null, $.proxy(this.setAttr, null, this, this.model));
			this.$toggleVisibility.on('change', null, {view: this}, this.toggle_visibility);
			this.$colorbox.on('click', null, {view: this}, this.setLabelColor);		
			$('[type=fontStyle], [name=fontWeight]').on('change', null, $.proxy(this.setCheckboxAttr, null, this, this.model));
			
			Backbone.on("labelSelected", this.replace_model, this);
			
			this.model.on("change:id", this.collection.clone_model, this.collection);
			
			this.listenTo(Backbone, "add_option", this.add_option);
			this.listenTo(Backbone, "remove_option", this.remove_option);
						
			this.listenTo(Backbone, "add_discount", this.add_discount);
			this.listenTo(Backbone, "remove_discount", this.remove_discount);
			
			/* load stuff */
			
			this.fetch_options();
			this.fetch_image('customLabel');
			this.fetch_image('dealershipLogo');
			
			this.$dealershipName.text(this.model.get('dealershipName'));
			this.$dealershipTagline.text(this.model.get('dealershipTagline'));
		
			this.listenTo(this.model, 'change', this.set_field);

			return this;
		},
		
		set_field: function(model, options) {
			_.each(model.changed, function(el, i, list) {
			//console.log('LabelView:setField', el, i);
				$('#' + i).text(el);
			}, this);
		},

		replace_model: function(model) {
		//console.log('Replace Model', model);
			if (model) {
				this.model = model;			
				this.render();
			}
		},
		
		add_option: function(model, price) {
		//console.log('Add Option', model, price, this.label_options);
			var old_option = this.label_options[model.get('location')][model.get('option_name')];		
						
			price = (price) ? parseFloat(price).toFixed(2) : 0.00;
			model.set("price", price);
			
			if (old_option) {
				old_option.render();
			} else {
				var new_option = new LabelOption({model: model});
				this.label_options[model.get('location')][model.get('option_name')] = new_option;				
			}
			
			this.model.add_option(model.get('id'), price);			
			this.update_total(price, "Value", true);
		},
		
		remove_option: function(model, price) {
			price = (price) ? parseFloat(price).toFixed(2) : 0.00;

			this.label_options[model.get('location')][model.get('option_name')].detach_from_view(this);	
			this.model.remove_option(model.get('id'), price);
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
			var change = model.get_change();
			$('#' + change.key).text(change.value);
		},
		
		setText: function(view, model) {
			var name = $(this).attr('name');
			var value = $(this).val();
						
			model.set(name, value);
		},

		toggle_visibility: function(event) {
		//console.log('Toggle Visibility');
			$('#dealershipLogo, #dealershipText').toggleClass('invisible');
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