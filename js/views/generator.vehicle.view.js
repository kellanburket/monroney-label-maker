define(['jquery', 'underscore', 'backbone', 'vehicle-select', 'vehicle-input', 'combo'], function($, _, Backbone, VehicleSelect, VehicleInput, Combo) {
	
	var VehicleView = Backbone.View.extend({
		initialize: function(attributes) {
			this.type = attributes.type;
			////console.log('VehicleView:add_event', this, attributes);
			this.bigBrothers = {};
			this.selected_id = null;
			
			this.select = VehicleSelect.initialize({type: this.type, parent: this});
			this.input = VehicleInput.initialize({type: this.type, parent: this});			

			for (var i in attributes.parent_views) {
				////console.log(this.type + ' bigBrothers', attributes.parent_views[i], attributes.parent_views[i].select);
				this.bigBrothers[i] = attributes.parent_views[i];	
				this.bigBrothers[i].select.on('selection_changed', this.select.handle_parent_select, this.select);
				this.bigBrothers[i].select.on('show_all_options', this.select.show_all_options, this.select);
				this.bigBrothers[i].select.on('filter_options', this.select.filter_options, this.select);
				this.select.on('show_input_fields', this.bigBrothers[i].input.show, this.bigBrothers[i].input);
			}
			this.on('id_change', function(id) { this.selected_id = id; }, this);
			this.select.on('show_input_fields', this.input.show, this.input);					

			this.render();
			this.combo = new Combo({input: this.input, select: this.select});

		},
		
		render: function() {			
			this.$button_add = this.$el.children('.add-button');
			this.$button_add.on('click', $.proxy(this.add_new_item, null, this));	

			this.input.render(this.$el.children('input')[0]);	
			
			this.$button_destroy = this.$el.children('.destroy-button');
			this.$button_destroy.on('click', $.proxy(this.destroy_item, null, this.collection));		
			
			this.select.render(this.$el.children('select')[0]);
		},
		
		get_value: function() {
			if (this.select.selected.model != null) {
				return this.select.selected.model.get(this.type);
			} else if (this.input.$el.val() != null) {
				return this.input.$el.val();
			} else {
				return null;
			}
		},
		
		get_id: function() {
			return this.selected_id;
		},
	
		add_new_item: function(view) {
			var types = _.clone(view.bigBrothers);
			types[view.type] = view;			
			var attrs = {};
			var hasId = true;
						
			for (var i in types) {
				var name = types[i].get_value();
				
				if (name == null || name == '') {
					alert("Please Enter a " + type);
				}
				
				//console.log("View:get_value", name);
				if (name == null || name == '') continue;
				var type = types[i].type;
				var id = types[i].get_id();
				//console.log("View:get_id", id);
				
				if (!id) {
					var queue;

					var attrs_to_send = _.clone(attrs);
					attrs_to_send['type'] = type;
					attrs_to_send[type] = name;
					//console.log('add_new_item:input.data', attrs_to_send);				
					
					if (hasId) {
						switch (type) {
							case ('make'): Backbone.trigger("make:queue", attrs_to_send);
								break;
							case ('model'): Backbone.trigger("model:make_id:" + attrs_to_send['make_id'] + ":queue", attrs_to_send);
								break;
							case ('year'): Backbone.trigger("year:model_id:" + attrs_to_send['model_id'] + ":queue", attrs_to_send);
						}
					} else {
						vehicle_queue.push(null, attrs_to_send);
					}
				} else {
					attrs[type + '_id'] = id;
				}
				hasId = (attrs[type + '_id'] != null) ? true : false;
			}
			Backbone.trigger('clear_inputs');
			vehicle_queue.shift();			
		},
				
		destroy_item: function(collection) {
			$select = $(this).parent('li').children('select');
			
			var cid = $select.find(':selected').data('cid');
			if (cid) {
				var model = collection.get(cid);
				////console.log('remove:input', $select);
				////console.log('remove:cid', cid);
				//console.log('remove:model', model);
				collection.remove(model);
				var response = function(model, response, options) {
					//console.log('delete', options.xhr.responseText);
				}
				
				model.destroy({success: response, error: response});
			}
		},
	});
	
	var initialize = function(attrs, opts) {
		return new VehicleView(attrs, opts);
	}
	
	return {initialize: initialize};
});