	var Img = Backbone.Model.extend({
		defaults: {
			guid: '',
			id: ''
		},
		initialize: function(attrs, opts) {
			console.log("New Img", this);	
		},
	});
		
	var Imgs = Backbone.ExtendedCollection.extend({
		model: Img,		
		initialize: function(models, opts) {
			console.log("New Imgs Collection", this);
			this.userId = opts.userId;
			this.name = opts.name;
			this.ucfirst_name = this.name.charAt(0).toUpperCase() + this.name.substr(1, this.name.length);
			this.pluralName = opts.pluralName;
			
			var request = 'request' + this.ucfirst_name;			
			this.listenTo(Backbone, request, this.handle_request); 
		},

		handle_request: function(id) {
			var model = this.get(id);
			//console.log('Handle Request', id, model);
			if (model) {
				Backbone.trigger('return' + this.ucfirst_name, model); 
			}
		},		
	});

	var ImgView = Backbone.View.extend({
		tagName: 'img',
		
		initialize: function(attrs, opts) {
			console.log('ImgView', this);
			this.name = attrs.name;
			this.ucfirst_name = this.ucfirst_name = this.name.charAt(0).toUpperCase() + this.name.substr(1, this.name.length);
			this.render();
		},
		
		render: function() {
			this.$el = $('<' + this.tagName + '>', {src: this.model.get('guid'), class: this.name + "View"}); 
			this.el = this.$el[0];			
			console.log("Rendering " + this.name, this.$el);

			this.$el.click($.proxy(this.select_image, this));
			return this;
		},
			
		select_image: function() {
			Backbone.trigger("selectImage", this.name, this.model);
		}
	
	});
	

	var ImgsView = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.children = [];
			this.childrenById = {};
			this.name = attrs.name;
			this.pluralName = attrs.pluralName;
			this.dropzoneId = attrs.dropzoneId;
			this.$dropzone = $('#' + this.dropzoneId);
			this.render();
			this.listenTo(Backbone, 'userLoggedIn', this.set_new_collection);			
		},
		
		set_new_collection: function(user) {
			this.collection = user.get(this.pluralName);
			console.log("Set New Collection", user, this.collection);
			this.render();
		},
		
		render: function() {
			
			if (this.collection) {
				_.each(this.collection.models, function(el, i, list) {
					console.log('Rendering ' + this.pluralName, el, i);
					this.children[i] = new ImgView({model: el, name: this.name});
					this.childrenById[el.id] = i;
					this.$el.append(this.children[i].el);
				}, this);
			} else {
				console.log("Render ImgsView", this);
			}

			if (!this.dropzone_form) this.render_dropzone();
			else this.enable_dropzone();

		},
		
		render_dropzone: function() {
			console.log("Rendering Dropzone");
			var init = function(id, userId) {
				this.on("sending", function(file, xhr, form) {
					//id = view.model.get('userId');
					form.append("user_id", userId);
					form.append("file_dir", id); 
				//console.log("sending", dir, user_id);
				});
				this.on("success", function(file, data) {
					//console.log("success", data, big_event);
					data = $.parseJSON(data);
					if (data.guid) {
						Backbone.trigger("imageAdded", data.guid, data.id, id);
					}
				});
			}
			
			//console.log('Imgs', this);
			this.dropzone_form = new Dropzone('#' + this.dropzoneId, {
				url: this.collection.url,
				method: "post",
				maxFileSize: 10,
				thumbnailHeight: this.$dropzone.height(),
				thumbnailWidth: this.$dropzone.width(),
				init: $.proxy(init, null, this.name, this.collection.userId)
			});

			this.$dropzone.text('< Log In to Upload Your Custom Image >');			
			
			this.dropzone_form.disable();		
		},
		
		enable_dropzone: function() {
			console.log("Enabling Dropzone");
			this.dropzone_form.enable();
			this.$dropzone.text('< Drag or Click to Upload Your Custom Image >');			
		}		
	});