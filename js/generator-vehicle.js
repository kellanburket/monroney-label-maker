	var thread_space = '';
	var Queue = function() {
		this._queue = Array();
		
		this.push = function(collection, attributes) {
			//console.log('add_to_queue:', collection, attributes);
			this._queue.push({collection: collection, attributes: attributes});			
		};
		
		this.shift = function(id, collection) {

			var object = this._queue.shift();
			var attributes = object.attributes;

			for(i in id) {
			 attributes[i] = id[i];
			}
			////console.log('queue.shift', object, collection, attributes);
			collection = (!collection) ? object.collection : collection;
			
			//console.log('queue.shift', collection, attributes);
			
			collection.create(attributes);
		}
		this.length = function() {
			return this._queue.length;
		}
		this.add_all = function() {
			////console.log('queue', this._queue);
			this._recursive_add(this._queue.shift()).fail(function() {
				//console.log('Recursive Function Failed');
			});
		};
		
		this._recursive_add = function(obj) {
			////console.log('Queue Length', this._queue.length);
			if (obj) {				
				var attr = obj.attributes;
				var coll = obj.collection;
				//console.log('_recursive_add', attr, coll); 
				return $.Deferred($.proxy(function(attr, collection) {
					//console.log('Deffered Return', attr);	
					return collection.create(attr);
				}, null, attr, coll))
				.promise()
				.then(this._recursive_add(this._queue.shift()));
			} else {
				return $.Deferred().promise();
			}
		};
	};
	
	vehicle_queue = new Queue;
	
	var Vehicle = Backbone.Model.extend({
		defaults: {
			make: '',
			model: '',
			year: '',
			vin: '',
			msrp: '',
			trim: ''
		},
		initialize: function() {
			//this.urlRoot += this.get('name');
		},
	});

	var VehicleMake = Backbone.Model.extend({
		defaults: {
			type: 'make',
			id: null,
			make: null,
			models: null
		},
		initialize: function(attributes, options) {
			var model = this;
			Backbone.trigger('add_new_make', this);
			if (this.id) {
				this.set_models();					
			}
		},
		get_constraints: function() {
			return {};
		},
		set_models: function() {
			console.log("New Vehicle Make(" + this.id + "): " + this.get('make'));

			//console.log('App.models', App.models);
			var data = _.where(App.models, {make_id: this.id});
			var models = new VehicleType([], {
				data: data, 
				url: restful.url + 'models?make_id=' + this.id, 
				model: VehicleModel, 
				type: 'model:make_id:' + this.id}
			);

			return this.set('models', models);
		},
		set_id: function(id) {
			this.id = id;
			Backbone.trigger('postadd:' + this.id, this.id, this.get('make'));
			return this.set_models();
		},
		get_collection: function() {
			return this.models;
		},
		get_sucess_message: function(arguments) {
			//console.log('Success:' + this.get(this.get('type')), arguments);
		},
		get_error_message: function(arguments) {
			//console.log('Error:' + this.get(this.get('type')), arguments);		
		},
		urlRoot: function() { 
			////console.log(this);
			//return restful.url + 'makes/' + this.cid;
		}
	});

	var VehicleModel = VehicleMake.fullExtend({
		defaults: {
			type: 'model',
			model: null,
			make_id: null,
			years: null,
		},
		get_constraints: function() {
			return {make_id: this.get('make_id')};
		},		
		initialize: function(attributes, options) {
			var model = this;
			
			if (this.id) this.set_years();
			console.log('New Vehicle Model(' + model.get('model') + ', ' + model.id + ')', model.attributes);
		},
		
		set_years: function() {
			Backbone.trigger('add_new_model', this);	
			Backbone.trigger('postadd:' + this.id, this.id, this.get('model'));
			var data = _.where(App.years, {model_id: this.id, make_id: this.get('make_id')});
			
			var years = new VehicleType([], {
				data: data, 
				model: VehicleYear, 
				url: restful.url + 'years?model_id=' + this.id + '&make_id=' + this.get('make_id'), 
				type: 'year:model_id:' + this.id
			});
			//console.log('New Years(' + this.id + ')', years);

			return this.set('years', years);
		},
		set_id: function(id) {
			this.id = id;
			return this.set_years();
		},
		get_collection: function() {
			return this.years;
		},
		urlRoot: restful.url + '/models'
	});

	var VehicleYear = VehicleModel.fullExtend({
		defaults: {
			type: 'year',
			year: null,
		},
		initialize: function(attributes, options) {
			if (this.id) { 
				Backbone.trigger('add_new_year', this);						
				console.log('New Vehicle Year(' + this.get('year') + ', ' + this.id + ')', this);
			}
		},
		set_id: function(id) {
			this.id = id;
			Backbone.trigger('add_new_year', this);
			Backbone.trigger('postadd:' + id, id, this.get('year'));
		},
		get_constraints: function() {
			return {make_id: this.get('make_id'), model_id: this.get('model_id')};
		},		
		get_collection: function() {
			return null;
		}
	});
	


	var VehicleStat = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.render(attrs.el);
		},
		render: function(el) {
			
			this.el = el;
			this.$el = $(this.el);
			//console.log('el', this, this.$el);
			this.$el.change($.proxy(this.update_field, null, this));
		},
		update_field: function(view) {
			var new_value = $(this).val();
			view.model.set({value: new_value}, {validate: true});
		}
	})
	
	var VehicleType = Backbone.Collection.extend({
		initialize: function(models, opts) {
			//console.log('VehicleType:init', opts);
			this.url = opts.url;
			this.type = opts.type;
			
			if (opts.data) {
				this.set_models(opts.data);
			}					

			this.listenTo(Backbone, this.type + ':queue', this.push_queue);		
		},
		
		set_models: function(models) {
			_.each(models, function(element, index, list) {
				var new_model = new this.model(element);					
				this.add(new_model);	
			}, this);			
		},
		
		parse: function(resp, options) {
      		//console.log('Collection:Parse:', resp, options);
			return resp;
    	},
		
		push_queue: function(attr) {
			//console.log(this.type + ':queue', attr);
			vehicle_queue.push(this, attr);					
		},
		
		create: function(attributes, options) {						
			////console.log('Create:Collection(' + this.type + ')', attributes);
			options = (!options) ? {} : options;
			attributes = (!attributes) ? {} : attributes;
			var result_var = this.findWhere(attributes[this.type]);
			
			if (!result_var) {
				////console.log('Create', attributes);
				options['url'] = this.url;
			 	
				var new_options = {}
				var that = this;
				var new_model = new this.model(attributes, options);
				
				new_options['success'] = function(collection, response, xhr) {
					var json_response = $.parseJSON(xhr.responseText);
					
						
					if (json_response.success = true) {
						////console.log('Success', json_response);
						
						that.add(new_model);
						new_model.trigger();
						if (vehicle_queue.length()) {
							var change_event;
							if (that.type == 'make')
								change_event = "change:models";
							else if (that.type.indexOf(':make_id') > 1) 
								change_event = "change:years";
							
							////console.log('change_event', that.type, change_event, new_model);	
							
							that.on(change_event, function(model, value, options) {
								////console.log('change_event trigger', model, value, options);
								var id_type = {};
								if (that.type == 'make')
									id_type['make_id'] = model.id;
								else if (that.type.indexOf(':make_id') > 1) 
									id_type['make_id'] = model.get('make_id');
									id_type['model_id'] = model.id;
								vehicle_queue.shift(id_type, value);
							});
						}
						new_model.set_id(json_response.id);
						
						var new_model_type = new_model.get('type');
						var new_model_name = new_model.get(new_model_type);
						
						
						
						////console.log('New Model', new_model);
						
					
					} else if(json_response.message = "Already Added") {
						//console.log("Already Added", json_response);
					}
				};
				
				new_options['error'] = function(xhr, response, error) {
					//console.log('Error', xhr.responseText);
				};
				
				new_options['data'] = {};
				
				for (i in attributes) {
					new_options['data'][i] = new_model.get(i);	
				}
				new_options['dataType'] = 'json';
				new_options['data']['id'] = new_model.cid;
				new_options['processData'] = true;
	
				for (i in options) {
					new_options[i] = options[i];
				}
				
				return Backbone.sync('create', new_model, new_options);
			} else {
				console.warning('Create:Collection(' + this.type + ') has already been Set!', attributes, result_var);
			}
		}		
	});

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
			this.options[id] = new VehicleOption({el: this.$el.children('[value=' + id + ']')[0]}, {type: 'option', parent: this, id: id});
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
			console.log("Select.render_option", this, model);
			this.options[model.id] = new VehicleOption({model: model}, {type: this.type, id:model.id, parent: this}).render();
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
	});

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
			this.hide();
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
	
	var VehicleView = Backbone.View.extend({
		initialize: function(attributes) {
			this.type = attributes.type;
			////console.log('VehicleView:add_event', this, attributes);
			this.bigBrothers = {};
			this.selected_id = null;
			this.select = new VehicleSelect({type: this.type, parent: this});
			this.input = new VehicleInput({type: this.type, parent: this});			

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