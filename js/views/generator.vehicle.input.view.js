define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var VehicleInput = Backbone.View.extend({
		initialize: function(attrs) {
			this.type = attrs.type;
			this.parent = attrs.parent;		
			this.listenTo(this.parent, 'id_change', this.update_id);
			this.isVisible = false;

			this.inputsCleared = true;
		},

		render: function(el) {
			this.el = el;
			this.$el = $(this.el); 
		},
		show: function(type) {
			//console.log('ShowInputs(' + this.type + ')', this.isVisible);
			
			if (this.isVisible == true) {
				Backbone.trigger('clear_inputs');					
			}

			this.$el.fadeIn();			

			if (this.type == type) {
				this.parent.$button_add.show();
				this.$el.focus();
			} else {
				var selected = this.parent.select.selected;
				if (selected.model != null) {
					this.$el.val(selected.model.get(this.type));
				}
			}
			this.isVisible = true;
			this.listenToOnce(Backbone, 'clear_inputs', this.hide);
		},
		hide: function() {
			////console.log('Clear', this.$el);
			this.$el.val('');
			this.$el.hide();
			this.parent.$button_add.hide();
			this.isVisible = false;
		}
	});
	
	var initialize = function(attrs, opts) {
		return new VehicleInput(attrs, opts);
	}
	
	return {initialize: initialize};
});