define(['jquery', 'underscore', 'backbone', 'dropzone', 'util/authenticate', 'img-view'], function($, _, Backbone, Dropzone, authenticate, ImgView) {

	var ImgsView = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.children = [];
			this.childrenById = {};
			this.name = attrs.name;
			this.pluralName = attrs.pluralName;
			this.dropzoneId = attrs.dropzoneId;
			this.$dropzone = $('#' + this.dropzoneId);
			this.dropzone_form = null;
			this.render();
		},
		
		set_new_collection: function(user) {

			for (var i = 0; i < this.children.length; i++) {
				var child = this.children.pop();
				this.unrender_child(child);
			}

			this.collection = user.get(this.pluralName);			
			//console.log("Set New Collection", user, this.collection);
			this.dropzone_form.options.url = this.collection.url;
			this.dropzone_form.options.headers = {Authentication: authenticate(user, this.collection.url, "POST")};
			this.render();
		},
		
		render: function() {
			//console.log('Rendering ' + this.pluralName);			
			this.stopListening();
			
			this.listenTo(Backbone, 'userLoggedIn', this.set_new_collection);			
			if (this.collection.length > 0) {
	
				_.each(this.collection.models, function(el, i, list) {
					this.render_child(el);
				}, this);

				this.listenTo(this.collection, 'add', this.render_child);
	
				this.listenTo(this.collection, 'destroy', $.proxy(function(model, collection) {
					//console.log("Destroy Model", model.get('id'), this.childrebById);
					this.unrender_child(this.children[this.childrenById[model.get('id')]]);
				}, this));


			} else {
				//console.log("Render ImgsView", this);
			}

			if (!this.dropzone_form) this.render_dropzone();
			else this.enable_dropzone();
			
			this.$el.css({verticalAlign: 'top'});

		},

		render_child: function(el, collection, options) {
			var index = this.children.length;
			this.children[index] = ImgView.initialize({model: el, name: this.name});
			this.childrenById[el.id] = index;
			this.$el.append(this.children[index].el);
		},
		
		unrender_child: function(child) {
			
			//console.log("Unrender Child", child);
			if (child) {
				var id = child.model.get('id');
				child.$el.remove();
				delete this.childrenById[id];
			}
		},
				
		
		render_dropzone: function() {
			//console.log("Rendering Dropzone");
			var init = function(view) {
				this.on("sending", function(file, xhr, form) {
					//id = view.model.get('userId');
					form.append("file_dir", view.pluralName); 					
					//console.log("sending", view.pluralName, view.collection.userId, view.collection.url);
				});
				this.on("success", function(file, data) {
					data = $.parseJSON(data);
					//console.log("success", data);
					
					if (data.guid) {
						Backbone.trigger("imageAdded", data.guid, data.id, view.name);
						view.collection.add({guid: data.guid, id: data.id});
					}
				});
			}
			
			//console.log('Imgs', this.collection.url);
			this.dropzone_form = new Dropzone('#' + this.dropzoneId, {
				url: this.collection.url,
				method: "POST",
				maxFileSize: 10,
				headers: {Authentication: authenticate(this.collection.user, this.collection.url, "POST")},
				thumbnailHeight: this.$dropzone.height(),
				thumbnailWidth: this.$dropzone.width(),
				init: $.proxy(init, null, this)
			});

			
			var response_code = 'returnUserCredentials';
			Backbone.trigger('checkUserCredentials', response_code);
			this.listenToOnce(Backbone, response_code, $.proxy(function(response) {
				//console.log("Listening to " + response_code);
				if (!response.message) {
					this.$dropzone.text('< Log In to Upload a .png, .jpg, or .gif >');			
					this.dropzone_form.disable();		
				} else {
					this.$dropzone.text('< Click to Add Images for Super User >');			
				}
			}, this));
			
		},
		
		enable_dropzone: function() {
			//console.log("Enabling Dropzone");
			this.dropzone_form.enable();
			this.$dropzone.text('< Drag or Click to Upload a .png, .jpg, or .gif >');			
		}		
	});
	
	var initialize = function(attrs, opts) {
		return new ImgsView(attrs, opts);	
	}
	
	return {initialize: initialize};
});