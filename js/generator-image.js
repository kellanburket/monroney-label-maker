
	var Img = Backbone.Model.extend({
		defaults: {
			guid: '',
			caption: '',
		},
	
		initialize: function() {},
	
		handle_server_sync: function(model, response, options) {
			//debug_server_response("Handling Server Sync", model, response, options);		
		},
		
		handle_server_error: function(model, response, options) {
			//debug_server_response("Handling Server Error", model, response, options);		
		},
	
		urlRoot: restful.url + 'label_images/'
	});
	
	var Imgs = Backbone.Collection.extend({
		model: Img,
		url: restful.url + 'label_images/',

		initialize: function() {
		},
		
		create: function(attributes, options) {
			
			var new_model = new Img(attributes, options);
			var new_options = {}
			var that = this;
			
			new_options['success'] = function(collection, response, option) {
				that.add(new_model);
				//debug_server_response('Handling Img Save Response: Success', collection, response, option);
			};
			new_options['error'] = function(collection, response, option) {
				//debug_server_response('Handling Img Save Response: Error', collection, response, option);						
			};
			new_options['data'] = {guid: new_model.get('guid'), caption: new_model.get('caption')};
			new_options['processData'] = true;
			
			for (i in options) {
				new_options[i] = options[i];
			}
						
			//triggers "request" event as the new model is sent to the server
			Backbone.sync('create', new_model, new_options);
			//triggers 
	
			//triggers "add" event on Imgs
			
	
			return new_model;
		}
	});
	
	var ImgView = Backbone.View.extend({
		className: 'customLabelView',
		tagName: 'img',
		
		initialize: function() {
			this.model.on('change:dealershipLogo', this.renderLogo, this);	
		},
		
		render: function(collection) {
			//console.log('Rendering Image Model View');
			//console.log('model $el', this.$el);
			//console.log('model guid', this.model.get('guid'));
			this.$el.attr('src', this.model.get('guid'));
			$(collection.el).prepend(this.el);
			return this;
		},
	
	});
	
	var ImgsView = Backbone.View.extend({
		el: '.tag-gallery',
		
		
		initialize: function() {
			var that = this;
			
			this._imgViews = {};
			
			//this.listenTo(this.collection, 'change:selected', this.render_image);		
		
			this.collection.on("add", this.handle_add, this);		
			this.collection.each(function(img) {
				that._imgViews[img.cid] = new ImgView({model: img});
			});
			this.render();
		},
		
		handle_add: function(model, collection, options) {
			//console.log('handle_add(model)', model);
			//console.log('handle_add(collection)', collection);
			//console.log('handle_add(options)', options);
			//console.log('handle_add->this', this);
			
			this._imgViews[model.cid] = new ImgView({model: model});
			this._imgViews[model.cid].render(this);
			
			this.$el.prepend(this._imgViews[model.cid].el);
		},
			
		render: function() {
			var images = this;

			_(images._imgViews).each(function(iv) {
				iv.render(images);
				$(iv.el).on("click", null, $.proxy(images.image_click, images, iv, iv.model, images.collection));
			});
		},
		
		get_view_by_cid: function(cid) {
			return _imgViews[cid];		
		},
		

	});