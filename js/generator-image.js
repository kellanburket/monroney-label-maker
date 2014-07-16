
	var Img = Backbone.Model.extend({
		defaults: {
			guid: '',
			caption: '',
		},
	
		initialize: function(attrs, opts) {
			console.log("New Img", attrs, opts);	
		},
	
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
		initialize: function(models, opts) {
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

			Backbone.sync('create', new_model, new_options);
			return new_model;
		}
	});
	
	var ImgView = Backbone.View.extend({
		className: 'customLabelView',
		tagName: 'img',
		
		initialize: function() {
			//this.model.on('change:dealershipLogo', this.render, this);	
			console.log('ImgView', this);
			this.render();
		},
		
		render: function(collection) {
			this.$el.attr('src', this.model.get('guid'));
			
			this.$el.click($.proxy(this.select_image, this));
			
			return this;
		},
		
		select_image: function() {
			Backbone.trigger('select_featured_image', this.model);
		}
	
	});
	
	var ImgsView = Backbone.View.extend({
		el: '.tag-gallery',
		
		
		initialize: function(attrs, opts) {
			//console.log('Initialize ImgsView', this.collection);
			this._imgViews = {};
			//this.listenTo(this.collection, 'change:selected', this.render_image);				
			this.collection.on("add", this.handle_add, this);		
			
			this.render();
		},
		
		handle_add: function(model, collection, options) {
			
			this._imgViews[model.cid] = new ImgView({model: model});
			this._imgViews[model.cid].render(this);
			
			this.$el.prepend(this._imgViews[model.cid].el);
		},
			
		render: function() {
			var images = this;

			_.each(this.collection.models, function(el, i, li) {
				this._imgViews[el.id] = new ImgView({model: el});				
				$(this.el).prepend(this._imgViews[el.id].el);			
			}, this);

		},
		
		get_view_by_cid: function(cid) {
			return _imgViews[cid];		
		},
		

	});