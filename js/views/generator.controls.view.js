define(['jquery', 'underscore', 'backbone', 'dialog', 'yes-no-dialog', 'modal', 'user', 'util/uniqid', 'util/authenticate', 'label', 'labels'], function($, _, Backbone, Dialog, YesNoDialog, Modal, User, uniqid, authenticate, Label, Labels) {

	//PDFJS.workerSrc = workerSrc;
	var INVALID_USER_NAME = 1;
	var NAME_ALREADY_REGISTERED = 2;
	var EMAIL_ALREADY_REGISTERED = 3;
	var INVALID_CHARACTERS_IN_NAME = 4;
	
	var PDFControls = Backbone.View.extend({

		initialize: function(attrs, opts) {
			this.collection = attrs.collection;
			this.user = attrs.user;
			this.render();			
			$('.tooltip').parent().hover(function(){ 
				$(this).children('.tooltip').css('visibility', 'visible'); 
			}, function(){
				$(this).children('.tooltip').css('visibility', 'none'); 
			});
		},

		render: function() {
			this.scale = .7;
			this.stopListening();
			
			this.$save = $('#save-label');
			this.$load = $('#load-label');
			this.$inspect = $('#inspect-label');
			this.$reset = $('#reset-label');
			this.$print = $('#print-label');
			this.$login = $('#login-label');
			this.$signup = $('#signup-label');
			
			this.$login.off('click');
			this.$login.on('click', $.proxy(this.log_in, this));

			this.$signup.off('click');
			this.$signup.on('click', $.proxy(this.sign_up, this));

			this.$save.off('click');
			this.$save.on('click', $.proxy(this.save_form, this));

			this.$load.off('click');
			this.$load.on('click', $.proxy(this.load_form, this));

			this.$inspect.off('click');
			this.$inspect.on('click', $.proxy(this.inspect_form, this));

			this.$reset.off('click');
			this.$reset.on('click', $.proxy(this.reset_form, this));
			
			this.$print.off('click');
			this.$print.on('click', $.proxy(this.print_form, this));

			this.listenTo(Backbone, "labelSelected", this.replace_model);
			this.listenTo(Backbone, "showFailMessage", this.show_fail_message);
			this.listenTo(Backbone, "destroyImage", this.destroy_item_model);
			this.listenTo(Backbone, "destroyOption", this.destroy_item_model);
			this.listenTo(Backbone, "checkUserCredentials", this.check_user_credentials);
		},
		
		replace_model: function(model) {
			if (model) {
				this.model.stopListening();
				this.model = model;
				this.render();
			}			
		},
		/**
		**		Manage User Resources
		**/
		destroy_item_model: function(model, url, msg) {
			//console.log("Attempt Image Destruction", model);
			var user = this.collection.user;
			var self = this;
			YesNoDialog.initialize(
				msg,				
				function() {
					model.destroy({
						beforeSend: function (xhr) {
							//console.log("xhr", xhr);
							xhr.setRequestHeader('Authentication', authenticate(user, url, 'DELETE'));
						},
						
						success: function(model, response) {
							//console.log(response);
							//response = $.parseJSON(response);
							
							if (response.success) {
								
							} else {
								self.show_fail_message(response.message);
							}							
						},
						error: function(model, response) {
							//response = $.parseJSON(response);
							self.show_fail_message('We were not able to complete your request');	
							//console.log("Model Destruction Error", response); 
						}
					});		
					Modal.close();				
				}, 
				
				function() {
					Modal.close();
				}
			);
		},

		attempt_option_destruction: function(model, url) {
			//console.log("Attempt Option Destruction", model);

			var user = this.collection.user;

			YesNoDialog.initialize(
				"Are you sure you want to permanently remove this option?",
				
				function() {
					model.destroy({
						beforeSend: function (xhr) {
							//console.log("xhr", xhr);
							xhr.setRequestHeader('Authentication', authenticate(user, url, 'DELETE'));
						},
						
						success: function(model, response) {
							//console.log("Model Destroyted", response);	
						},
						error: function(model, response) {
							//console.log("Model Descruction Error", response); 
						}
					});		
					Modal.close();				
				}, 
				
				function() {
					Modal.close();
				}
			);
		},		
		
		
		/**
		**		On Save Click
		**/
		save_form: function() {
			if (!this.validate_user()) return false;
			//console.log("Model", this.model);

			$name = $('<input>', {type: 'text', class: 'tag-input nonmandatory', name: 'labelName'});

			var id = (this.model) ? this.model.get('id') : null;
			$select = this.get_label_select('label-save-selector', id, false); 	

			var dialog = new Dialog(
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
					custom_image_id: this.model.get('customImageId'),
					display_logo: this.model.get('displayLogo'),
					option_ids: this.model.get('optionIds'),
					option_prices: this.model.get('optionPrices'),
					//discount_ids: this.model.get('discount_ids')
					user_id: this.collection.user.get('id'),
					id: (parseInt(this.model.get('id')) > 0) ? this.model.get('id') : null,
					name: this.model.get('name')
				};
			return data;		
		},

		on_user_save: function(data) {
			var data = _.extend(this._gather_save_data(), {name: data.labelName});
			//console.log('save_form', data);
			var request;
			var id = $('#label-save-selector option:selected').val();
			
			if (id > 0) {
				request = 'PUT';	
			} else {
				request = 'POST';
			}
			
			//console.log("on_user_save:collection.url", this.collection);
			
			this._do_ajax(data, request, this.collection.url(), this.on_save_successful);			
		},

		on_save_successful: function(data) {
			Modal.displayMessage('Form saved.', 'success-message align-center');			

			if (data.method.match(/post/i)) {
				Backbone.trigger('modelSavedAs', data.id);
			}

			this.model.set('id', data.id);
			this.model.set('name', data.name);
		},
		
		get_label_select: function(selector_id, selected_id, appendAddNew) {
			appendAddNew = appendAddNew || true;
			selected_id = selected_id || 0;
								
			$select = $('<select>', {id: selector_id, class: 'tag-select', style: 'width: 250px; display: block; margin: 0 auto;'});			
			//console.log("Loading Selector", $select);

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

			$('#' + selector_id).on('change', function() {
				//console.log("Selector Changed", $(this).children(':selected'));
			});

			return $select;
			
		},
		
		/**
		**		On Load Click
		**/		
		load_form: function() {
			if (!this.validate_user()) return false;
			
			var select_id = 'label-load-selector';
			$select = this.get_label_select(select_id);
			var dialog = new Dialog({
				fields: [{label: 'Please Select a Form to Load', field: $select}], 
				id: 'loadForm', 
				class: 'dialogForm',
				submitText: 'Load',
				submitClass: 'tag-button',
				submitId: 'load-button'
			},
				{callback: $.proxy(this.on_label_load, this, select_id), context: this}
			);
		},
		
		on_label_load: function(select_id) {
			if (typeof select_id == 'object') {
				$select = select_id;
			} else {
				$select = $('#' + select_id);
			}
			//console.log("Select", $select);			
			$selected = $select.children(':selected');
			var name = $selected.text() || ""; 
			var id = $selected.val() || 0;
			
			//console.log('on_label_load', id);
			
			Modal.close();	
			var model = this.collection.get(id);
			//console.log("Loaded Label", id, model.get('id'));
			this.model = model;
			Backbone.trigger('labelSelected', this.model); 
		},
		
		reset_form: function() {
			$('input.tag-input').val('');
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
		
		/**
		** Show PDF
		**/
		
		print_form: function() {
			this._get_form(this.print_pdf);
		},
		
		inspect_form: function() {
			this._get_form(this.show_pdf, {preview: true});
		},

		_get_form: function(callback, options) {
			options = options || {};			
			var data = _.extend(this._gather_data(), _.extend({
				callback: 'generate_pdf_label',
				username: this.collection.user.get('name'),
				labelname: this.model.get('name') || "nothing" 				
			}, options));
			
			this._do_ajax(data, 'POST', ajax.url, callback, {contentType: 'application/x-www-form-urlencoded', processData: true});					
		},
		
		print_pdf: function(data) {
			var win = window.open(data.pdf, '_blank');
			Modal.close();
			if (!win) {
				this.show_fail_message("Please Disable Popup Blocking to Use this Feature");
			}
			//var pdf = window.open(data.pdf);
			//pdf.print();
		},

		show_pdf: function(data) {
			//console.log('Canvas', data.pdf);
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
			$name = $('<input>', {type: 'text', class: 'tag-input', name: 'loginName'});
			$passw = $('<input>', {type: 'password', class: 'tag-input', name: 'loginPassword'});
			
			var dialog = new Dialog(
				{	fields: 
					[
						{label: 'Name', field: $name}, 
						{label: 'Enter a Password', field: $passw}, 
					],
					id: 'loginForm', 
					submitText: 'Log In',
					submitId: 'loginButton'
				},
				
				{
					callback: $.proxy(function(data) {
							//console.log("Data", data);
							this._do_ajax(data, 'POST', restful.url + '/users/' + data.loginName, this.on_successful_log_user_in);
						}, this),
					context: this
				}
			);
		},

		on_successful_log_user_in: function(data) {
			this._init_user(data);
			$doc = $('<div>');
			$head = $('<h3>', {text: 'Welcome back, ' + data.name + '. Please select a label:', class: 'success-message align-center'});			

			var select_id = 'label-login-selector';
			$select = this.get_label_select(select_id); 

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
			if (data.id != this.collection.user.get('id')) {
						
				var user = new User(data, {parse: true});
				//var coll = this.collection.parse(data.labelgen_labels);		
				var labels = user.get('labels');
				//console.log("New Collection", labels);
				this.collection = labels;
	
				this.model.set('user', user);
				this.hide_login_links();
				Backbone.trigger('userLoggedIn', user);
			}
		},
		
		validate_user: function() {
			//console.log('Validate User', this);
			if (this.collection.user.get('id') > 0) {
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
			$('.welcome-user-text').removeClass('invisible').text('Welcome ' + this.model.get('user').get('name') + '!');			
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
			
			var dialog = new Dialog(
				{fields: 
					[
						{label: 'Username', field: $name}, 
						{label: 'Email', field: $email}, 
						{label: 'Enter a Password', field: $passw}, 
						{label: 'Retype Password', field: $retype}
					],
					id: 'signupForm', 
					submitText: 'Sign Up',
					submitId: 'signup-button'
				},
				{	
					callback: $.proxy(function(data) {
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
			Modal.displayMessage('Congratulations, ' + data.name + '. You have been signed up to use the Monroney Label Generator. You can login again using your password and the email you registered with. Thank you for doing business with us.', 'success-message align-center');			
			//console.log("Successful User Sign Up", data);
			this._init_user(data);			
		},
		
		show_fail_message: function(message) {
			Modal.displayMessage(message, 'fail-message');		
		},
		
		show_dialog: function(tag, options, modal_animation) {
			modal = Modal.open(tag, options, modal_animation);		
		},
		
		show_alert: function(name, message) {
			$('[name="' + name +'"]').val('');					
			$('[name="' + name + '"]').css({backgroundColor: "#bf2026"});										
			Modal.prependContent('p', {class:"signupAlert", text: message});
		},
		
		handle_error: function(message) {
			var error_code = parseInt(message);
			switch(error_code) {
				case (INVALID_USER_NAME):
					break;
				case (NAME_ALREADY_REGISTERED):
					this.show_alert('signupName', "Please choose a different login name.");
					break;
				case (EMAIL_ALREADY_REGISTERED):
					this.show_alert('signupEmail', "This email has already been registered. Please check your records for the password");
					break;
				case (INVALID_CHARACTERS_IN_NAME):
					this.show_alert('signupName', "Allowed characters for username: A-Z, a-z, 0-9");				
					break;
				default:
					this.show_fail_message(message);				
			}
			

		},
		
		check_user_credentials: function(response_code) {
			var message = {};
			message.message = false;							
			var url = restful.url + "users/" + this.collection.user.get('name') + "/check_credentials";
			$.ajax({
				url: url,
				dataType: 'json',
				method: 'GET',
				headers: {Authentication: authenticate(this.collection.user, url, 'GET')}
			}).success(function(data) {
				data = $.parseJSON(data);
				//console.log("success", data);
				Backbone.trigger(response_code, data);									
			}).error(function() {
				//console.log("error", data);	
				Backbone.trigger(response_code, message);
			});
		},
						
		_do_ajax: function(data, method, url, callback, options) {
			data['action'] = ajax.action;
			Modal.showLoader();
			$('.signupAlert').remove();
			options = options || {};
			var contentType = 'application/json';
			var processData = false; 				
			var controls = this;

			contentType = options.contentType || contentType;
			processData = options.processData || processData;
			
			var json;
			
			if (!processData || method.match(/put/i)) {
				json = JSON.stringify(data);
			} else {
				json = data;
			}
			//console.log("Controls", json, contentType, processData);
			
			var user = this.collection.user;
			
			if (user.get('id') != 0) {				
				var headers = {
					Authentication: authenticate(user, url, method)
				};
			}

			//console.log('ajax.url(data, headers)', data, url);
			return $.ajax(url, {
				type: method,
				data: json,
				headers: headers,
				processData: processData,
				dataType: 'json',
				contentType: contentType,
			}).done(function(response) {
				
				if (typeof response === "object") {
					if (!response) {
						response = {};
						response.success = false;
					}
				} else {
					response = $.parseJSON(response);
				}			
				//console.log('post_form:done', response);
				
				if (response.success == true) {
					callback.call(controls, response);
				} else {
					controls.handle_error(response.message);
				}
				//var response = $.parseJSON(response);
			})
			.fail(function(response) {
				controls.show_fail_message("Something went technically wrong! If the problem persists, please contact the site administrator");
				//console.log('post_form:fail', response.responseText);
			});
		}


	});
	
	var initialize = function(attrs, opts) {
		return new PDFControls(attrs, opts);	
	}
	
	return {initialize: initialize};	
});