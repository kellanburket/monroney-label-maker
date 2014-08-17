define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	var Controls = Backbone.View.extend({

		list_view: '',
		add_button: '',
		input_fields: {},
		
		initialize: function(attrs, opts) {
		
			this.list_view = attrs.list_view;
			this.fields = attrs.input_fields;
			this.add_button = attrs.add_button;
			this.render();
		},
		render: function() {
			$(this.add_button).click($.proxy(this.add_new, this));
		},
		add_new: function(event) {
		//console.log("Add New Discount(Controls)", this);
			var new_item = {};	
			for (var field in this.fields) {
				new_item[field] = $(this.fields[field]).val();
				if (!new_item[field]) {
					//Modal.open({content: "Please set " + field});
					alert ("Please Fill in " + field);
					return false;
				}
			}
			this.list_view.collection.create(new_item);			
		}		
	});
	
	var initialize = function(atts, opts) {
		return new Controls(attrs, opts);
	}
	
	return {initialize: initialize};
});
