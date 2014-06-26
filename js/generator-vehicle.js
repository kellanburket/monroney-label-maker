	var Queue = function() {
		this._queue = Array();
		this.push = function(collection, attributes) {
			this._queue.push({collection: collection, attributes: attributes});			
		};
		
		this.add_all = function() {
			console.log('queue', this._queue);
			this._recursive_add(this._queue.shift()).fail(function() {
				console.log('Recursive Function Failed');
			});
		};
		
		this._recursive_add = function(obj) {
			console.log('Queue Length', this._queue.length);
			if (obj) {
				var attr = obj.attributes;
				var coll = obj.collection;
				console.log('_recursive_add', attr, coll); 
				return $.Deferred($.proxy(function(attr, collection) {
					collection.create(attr);
				}, null, attr, coll)).promise().then(this._recursive_add(this._queue.shift()));
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
			this.urlRoot += this.get('name');
		},
	});

	var VehicleMake = Backbone.Model.extend({
		defaults: {
			type: 'make',
			id: '',
			make: '',
			models: new VehicleAttrs()
		},
		urlRoot: function() { 
			console.log(this);
			return restful.url + 'makes/' + this.cid;
		}
	});

	var VehicleModel = VehicleMake.fullExtend({
		defaults: {
			type: 'model',
			model: '',
		},
		urlRoot: restful.url + '/models'
	});

	var VehicleYear = VehicleMake.fullExtend({
		defaults: {
			type: 'year',
			year: '',
		},
		urlRoot: restful.url + '/years'
	});

		
	var VehicleAttrs = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.url = options.url;
			this.viewType = this.model.prototype.defaults.type;
			
			//console.log('Collection:type', this.viewType);
			this.on('add', function(model, collection, options) { 
				console.log('Model Added to ' + collection.viewType, model);
			});
			this.listenTo(Backbone, this.viewType + ':queue', function(attr) {
				console.log('Backbone.trigger:queue', attr);
				vehicle_queue.push(this, attr);			
			});		
		},
		
		push_queue: function(attrs) {
			queue.push({collection: this, attributes: attrs});						
		},
		
		create: function(attributes, options) {						
			options = (!options) ? {} : options;
			attributes = (!attributes) ? {} : attributes;
			
			//var search_var = {}
			//search_var[this.viewType] = attributes[this.viewType]; 
			//console.log("Create:Search", search_var);
			var result_var = this.find_model(attributes[this.viewType]);
			console.log("Create:Where", result_var);
			
			if (!result_var) {
				//console.log('VehicleAttrs:Create', attributes);
				options['url'] = this.url;
			 
				var new_model = new this.model(attributes, options);
				new_model.set('id', new_model.cid);			
				
				var new_options = {}
				var that = this;
				
				new_options['success'] = function(collection, response, xhr) {
					var json_response = $.parseJSON(xhr.responseText);
					
					
					if (json_response.success = true) {
						console.log('Success', json_response.success);
						that.add(new_model);
						Backbone.trigger(this.viewType + ':postadd', new_model.cid);
					} else if(json_response.message = "Already Added") {
		
					}
				};
				
				new_options['error'] = function(xhr, response, error) {
					console.log('Error', xhr.responseText);
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
				
				Backbone.sync('create', new_model, new_options);
				return new_model;
			}
		},
		
		find_model: function(name) {
			var old_model;
			_.each(this.models, function(element, index, list) { 
				//console.log("element/index/list", element, index, list);
				//console.log("i/length", i + "/" + this.models.length);
				console.log('list', list, list[0], list[1]);
				
				var model_name = element.get(this.viewType);
				
				console.log('name/model name', name, model_name);
				
				if (model_name == name) {
					old_model = element;
					return false;
				}
			}, this);
			return old_model;
		}
		
	});
	
	var VehicleView = Backbone.View.extend({
		tagName: 'select',
		initialize: function() {
			this.render();
			this.collection.on('add', this.populate, this);
		},
		render: function() {			
			$input = this.$el.children('input');
			
			$input.click(function() {
				console.log('data:', $(this).data());
				$(this).data('cid', '');
			});
			
			$input.change(function() {
				var id = $(this).attr('name');
				var val = $(this).val();
				$('#' + id).text(val);
			});
			
			var type = $input.attr('name');
			
			this.$el.children('select').change($.proxy(this.select_attribute, null, $input, type));
		
			this.on('add', this.update_fields);
			
			this.collection.fetch({
				success: $.proxy(function(collection, response, xhr) {
					console.log('VehicleView:Success', collection, response, xhr);
				}, this), 
				error: $.proxy(function(collection, xhr, response) {
					console.log('VehicleView:Error', collection, xhr, response);		
				}, this)
			});
			
			
			$button_add = this.$el.children('.add-button');
			$button_add.on('click', $.proxy(this.add_new_item, null, this.collection));		
			$button_destroy = this.$el.children('.destroy-button');
			$button_destroy.on('click', $.proxy(this.destroy_item, null, this.collection));		

		},
		
		update_fields: function(model, collection, options) {
			var cid = model.cid;
			$input = this.$el.children('input');
			$input.data('cid', cid);
			console.log('input', $input);
		},
		
		select_attribute: function($input, type) {
			//console.log('Input > This: ', $input.val(), $(this).val());
			var cid = $('option:selected', this).data('cid');
			$input.val($(this).val());
			$input.data('cid', cid);
			$('#' + type).text($(this).val());
			
			console.log($input, cid);
		},
		
		populate: function(element, collection, options) {
			var type = element.get('type')
			var title = element.get(type);
			
			var data = 'data-cid="' + element.cid + '"';
			
			for (i in element.attributes) {
				var attr = element.attributes[i];
				//console.log(title + "(" + i + ")", attr);

				if (i && attr && i != type && i != 'type') {
					data += 'data-' + i + '="' + element.attributes[i] + '" ';	
				}
			
				
			}
			
			//console.log('Element(' + index + ')', title, type);
			this.$el.children('select').append('<option value="' + title + '" ' + data + '>' + title + '</option>');
		},
		
		add_new_item: function(collection) {
			
			var attrs = {};
			$parent = $(this).parents('li');
			$uncles = $parent.parent().children('li');
				
			$uncles.each(function() {
				$input = $(this).children('input');
				var i_val = $input.val();
				var i_name = $input.attr('name');
				
				var cid = $input.data('cid');
				attrs[i_name] = i_val;
				
				if (!cid) {
					Backbone.trigger(i_name + ":queue", _.clone(attrs));
				}
								
				if ( $(this).is($parent) ) {
					return false;
				}
			});
			
			vehicle_queue.add_all();
		},
				
		destroy_item: function(collection) {
			$select = $(this).parent('li').children('select');
			
			var cid = $select.find(':selected').data('cid');
			if (cid) {
				var model = collection.get(cid);
				//console.log('remove:input', $select);
				//console.log('remove:cid', cid);
				console.log('remove:model', model);
				collection.remove(model);
				var response = function(model, response, options) {
					console.log('delete', options.xhr.responseText);
				}
				
				model.destroy({success: response, error: response});
			}
		},
	});