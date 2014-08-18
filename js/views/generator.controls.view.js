define(['jquery', 'underscore', 'backbone', 'dialog', 'modal', 'pdf', 'crypto-js/enc-base64', 'crypto-js/hmac-sha1'], function($, _, Backbone, Dialog, Modal, PDFJS, Base64, HmacSHA1) {

	var INVALID_USER_NAME = 1;
	var NAME_ALREADY_REGISTERED = 2;
	var EMAIL_ALREADY_REGISTERED = 3;
	
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
					user_id: this.model.get('userId'),
					id: (parseInt(this.model.get('id')) > 0) ? this.model.get('id') : null,
					name: this.model.get('name')
				};
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
			var dialog = new Dialog({
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
		
		/**
		** Show PDF
		**/
		
		print_pdf: function(data) {
			var win = window.open(data.pdf, '_blank');
			if (!win) {
				this.show_fail_message("Please Disable Popup Blocking to Use this Feature");
			}
			//var pdf = window.open(data.pdf);
			//pdf.print();
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
			$email = $('<input>', {type: 'text', value: 'kellan.burket@gmail.com', class: 'tag-input', name: 'loginEmail'});
			$passw = $('<input>', {type: 'password', value: 'gaiden', class: 'tag-input', name: 'loginPassword'});
			
			var dialog = new Dialog(
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
			var user = new User(data, {parse: true});
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
			
			var dialog = new Dialog(
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
			Modal.displayMessage('Congratulations, ' + data.name + '. You have been signed up to use the Monroney Label Generator. You can login again using your password and the email you registered with. Thank you for doing business with us.', 'success-message align-center');			
			console.log("Successful User Sign Up", data);
			this._init_user(data);			
		},
		
		show_fail_message: function(message) {
			Modal.displayMessage(message, 'fail-message');		
		},
		
		show_dialog: function(tag, options, modal_animation) {
			modal = Modal.open(tag, options, modal_animation);		
		},
		
		uniqid: function(num) {
		    var id = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		    for(var i = 0; i < num; i++)
		        id += possible.charAt(Math.floor(Math.random() * possible.length));
		    return id;
		},
				
		_do_ajax: function(data, method, url, callback) {
			data['action'] = ajax.action;
			Modal.showLoader();

			var contentType = method.match(/put/i) ? 'application/x-www-form-urlencoded' : 'application/json; charset=utf-8';
			//var contentType = 'application/x-www-form-urlencoded';
			var controls = this;
			
			//console.log("Controls", this);
			
			var user = this.model.get('user');
			
			if (user.get('id') != 0) {
				var secret = user.get('secret');
				var user_name = user.get('name'); 
				//var date = new Date().toUTCString();
				//var encoded_date = encodeURIComponent(date);
				var nonce = this.uniqid(5);
				var msg = "GET+" + url + "+" + nonce;
				var digest = Base64.stringify(HmacSHA1(msg, secret));							
				var headers = {
					Authentication: "hmac " + user_name + ":" + nonce + ":" + digest
				};
			}

			console.log('ajax.url(data, headers)', data, headers);
			return $.ajax(url, {
				type: method,
				data: data,
				headers: headers,
				dataType: 'json',
				contentType: contentType,
			}).done(function(response) {
				console.log('post_form:done', response);
				if (response.success == true) {
					callback.call(controls, response);
				} else {
					controls.show_fail_message(response.message);
				}
				//var response = $.parseJSON(response);
			})
			.fail(function(response) {
				controls.show_fail_message("Something went technically wrong! If the problem persists, please contact the site administartor");
				console.log('post_form:fail', response.responseText);
			});
		}
	});
	
	var initialize = function(attrs, opts) {
		return new PDFControls(attrs, opts);	
	}
	
	return {initialize: initialize};	
});