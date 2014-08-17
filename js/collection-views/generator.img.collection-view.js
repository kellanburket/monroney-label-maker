define(['jquery', 'underscore', 'backbone', 'dropzone'], function($, _, Backbone, Dropzone) {

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
			//console.log("Set New Collection", user, this.collection);
			this.render();
		},
		
		render: function() {
			//console.log('Rendering ' + this.pluralName);			
			if (this.collection) {
				_.each(this.collection.models, function(el, i, list) {
					this.children[i] = new ImgView({model: el, name: this.name});
					this.childrenById[el.id] = i;
					this.$el.append(this.children[i].el);
				}, this);
			} else {
				//console.log("Render ImgsView", this);
			}

			if (!this.dropzone_form) this.render_dropzone();
			else this.enable_dropzone();
			
			this.$el.css({verticalAlign: 'top'});

		},
		
		render_dropzone: function() {
			//console.log("Rendering Dropzone");
			var init = function(view) {
				this.on("sending", function(file, xhr, form) {
					//id = view.model.get('userId');
					form.append("user_id", view.collection.userId);
					form.append("file_dir", view.pluralName); 
					
					//console.log("sending", view.pluralName, view.collection.userId, view.collection.url);
				});
				this.on("success", function(file, data) {
					data = $.parseJSON(data);
					console.log("success", data);
					
					if (data.guid) {
						Backbone.trigger("imageAdded", data.guid, data.id, view.name);
						view.collection.add({guid: data.guid, id: data.id});
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
				init: $.proxy(init, null, this)
			});

			this.$dropzone.text('< Log In to Upload Your Custom Image >');			
			
			this.dropzone_form.disable();		
		},
		
		enable_dropzone: function() {
			//console.log("Enabling Dropzone");
			this.dropzone_form.enable();
			this.$dropzone.text('< Drag or Click to Upload Your Custom Image >');			
		}		
	});
	
	var initialize = function(attrs, opts) {
		return new ImgsView(attrs, opts);	
	}
	
	return {initialize: initialize};
});