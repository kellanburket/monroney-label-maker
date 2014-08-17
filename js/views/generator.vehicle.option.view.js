define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var VehicleOption = Backbone.View.extend({
		tagName: 'option',
		initialize: function(attrs, opts) {
			//console.log('NewOptions', attrs, opts);
			this.isHidden = false;
			this.model = attrs.model;
			this.type = opts.type;
			this.parent = opts.parent;
			this.id = opts.id;
			this.parent.on('selection_changed:' + this.id, this.set_selected, this);
			this.listenTo(Backbone, 'postadd:' + this.id, this.set_selected, this);
		},

		set_selected: function() {
			//console.log('Handle VehicleOption:set_selected', this.id, this.$el);
			this.parent.$el.prop('selected', true);
		},
		
		render: function() {
			var name = this.model.get(this.type);
			var id = this.model.id;
			var data = '';
			
			for (i in this.model.attributes) {
				var attr = this.model.attributes[i];
				if (i && attr && i != this.type && i != 'type' && typeof attr !== 'object') {
					data += ' data-' + i + '="' + this.model.attributes[i] + '"';	
				}
			}
			//data.slice(0, -1);
			this.el = '<option value="' + this.model.id + '"' + data + '>' + name + '</option>';
			this.$el = $(this.el);
			//console.log('Handle VehicleOption:render', this.id, this.$el);
			return this;
		}	
	});
	
	var initialize = function(attrs, opts) {
		return new VehicleOption(attrs, opts);
	};
	
	return {initialize: initialize};
});