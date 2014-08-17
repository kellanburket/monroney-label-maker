define(['jquery', 'underscore', 'backbone', 'vehicle-option'], function($, _, Backbone, VehicleOption) {

	var VehicleSelect = Backbone.View.extend({
		initialize: function(attrs) {
			this.type = attrs.type;
			//console.log('Initializing Select', this.type);

			this.parent = attrs.parent;
			//this.on('all', function() { //console.log('EventTrigger', arguments); });
			//this.listenTo(Backbone, 'all', function() { //console.log('BackboneEventTrigger', arguments); });

			this.options = {};
			this.calculating = false;
			
			this.optionsFilters = false;
					
			this.selected = {};	
			this.selected_id = 0;
			this.selected_name = '';
			var add_event = "add_new_" + this.type;
			this.listenTo(Backbone, add_event, this.render_option); 
		},
		render: function(el) {
			this.el = el;
			this.$el = $(this.el);
			
			this.$el.change($.proxy(this.select_attribute, null, this, parent, this.parent.input, this.type));

			this.add_default_option('add_new');
			this.add_default_option('select_all');
			this.set_selected('select_all');
		},
		
		add_default_option: function(id) {
			this.options[id] = VehicleOption.initialize({el: this.$el.children('[value=' + id + ']')[0]}, {type: 'option', parent: this, id: id});
		},

		set_selected: function(id) {
			//if (this.calculating == true) return false;
			//else this.calculating = true;
			
			this.selected = this.options[id];
			//console.log('Thread:' + this.type + '(' + id + ')');
			this.selected_id = id;
			this.selected_name = (this.selected.model != null) ? this.selected.model.get(this.type) : '';

			if (this.parent.input.isVisible) {
				Backbone.trigger('clear_inputs');
			}

			if (this.selected.type == 'model' || this.selected.type == 'make' || this.selected.type == 'year' ) {
				//console.log('set_selected(' + id + ',' + this.selected.type + ')', this.selected);
				Backbone.trigger(this.type + 'Selected', id);

				for (i in this.parent.bigBrothers) {
					var bb_select = this.parent.bigBrothers[i].select;
					//console.log('Thread:' + this.type + '(' + id + ')');
					bb_select.set_selected(this.selected.model.get(i + '_id'));													
				}
				this.trigger('filter_options', this.selected_id, this.type);	
				this.parent.trigger('id_change', this.selected_id);
			} else if (this.selected.type == "option") {
				this.parent.trigger('id_change', null);
				if (this.selected_id == 'add_new') {
					this.trigger('show_input_fields', this.type);					
				} else if (this.selected_id == 'select_all') {
					if (this.optionsFiltered = true) {
						
						this.trigger('show_all_options');
						
					}
				}
			}

			//console.log('ThreadFinish:' + this.type + '(' + id + ')');
			//this.calculating = false;
		},
		
		handle_parent_select: function(selected) {
			if (selected.type != 'options' && selected.model != null && selected.model.get(selected.type + '_id') == selected.id) {
				////console.log('HandleSelect(' + this.type + ')', selected, this.selected.model);
				this.set_selected(selected.id);
			} else {
				//this.set_selected('select_all');
			}
		},
		
		filter_options: function(id, type) {
			_.each(this.options, function(element, index, list) {
				if (element.model != null) {
					if (element.model.get(type + '_id') != id) {
						////console.log('Filtering', element.id, this.$el.children('[value="' + element.id + '"]'));
						this.$el.children('[value="' + element.id + '"]').remove();
						element.isHidden = true;
					} else if (element.model.get(type + '_id') == id) {						
						if (element.isHidden == true) {
							this.$el.prepend(element.el);
							element.isHidden = false;
						}
					}
				}
			}, this);
			this.optionsFiltered = true;
		},
		
		show_all_options: function() {
			var constraints = this.model.get_constraints();
			_.each(this.options, function(element) {
				if (element.isHidden) {
					
					var keepHidden = false;
					for (i in constraints) {
						var constraint_id = element.model.get(i);
						if (constrains_id != constrains[i]) {
							keepHidden = true;
							break;
						}
					}
					
					if (!keepHidden) {
						this.$el.prepend(element.el);
						element.isHidden = false;					
					}
				}
			}, this);
			this.optionsFiltered = false;
		},
			
		render_option: function(model) {
		//console.log("Select.render_option", this, model);
			this.options[model.id] = VehicleOption.initialize({model: model}, {type: this.type, id:model.id, parent: this}).render();
			////console.log('Rendering Option', model, this, this.options[model.id].el);
			this.$el.prepend(this.options[model.id].el);
			//this.set_selected(model.id);
		},
		
		//this function runs whenever select changes 
		select_attribute: function(select, parent, input, type) {
			select.set_selected($('option:selected', this).val());
			select.trigger('selection_changed:' + select.selected_id);
			select.trigger('selection_changed', select.selected);
			Backbone.trigger('selection_changed:' + type, select.selected_id, select.selected_name);
		},
		auto_select: function(content) {
			Backbone.trigger(this.type + 'Updated', content);
		}
	});
	
	var initialize = function(attrs, opts) {
		return new VehicleSelect(attrs, opts);
	}
	
	return {initialize: initialize};
});
