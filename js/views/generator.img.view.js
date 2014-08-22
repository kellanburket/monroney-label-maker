define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var ImgView = Backbone.View.extend({
		tagName: 'img',
		
		initialize: function(attrs, opts) {
			//console.log('ImgView', this);
			this.name = attrs.name;
			this.ucfirst_name = this.ucfirst_name = this.name.charAt(0).toUpperCase() + this.name.substr(1, this.name.length);
			this.render();
		},
		
		render: function() {
			this.$el = $('<div>', {class: 'img-wrap'});
			this.$x = $('<span>', {class: 'img-x', text: 'x'});
			this.$img = $('<' + this.tagName + '>', {src: this.model.get('guid'), class: this.name + "View"}); 
			this.el = this.$el[0];			

			this.$el.append(this.$x, this.$img);
			//console.log("Rendering " + this.name, this.$el);

			this.$el.click($.proxy(this.select_image, this));
			this.$x.click($.proxy(this.destroy_image, this));

			return this;
		},
			
		select_image: function() {
			console.log("Select Image", this.name, this.model);
			Backbone.trigger("selectImage", this.name, this.model);
		},
		
		destroy_image: function() {
			Backbone.trigger("destroyImage", this.model, this.model.url());
		},
		
	
	});
	
	var initialize = function(attrs, opts) {
		return new ImgView(attrs, opts);
	}
	
	return {initialize: initialize};
});

