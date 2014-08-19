define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

	return Backbone.Collection.extend({
		initialize: function(models, opts) {
			//console.log('VehicleType:init', opts);
			this.url = opts.url;
			this.type = opts.type;
			this.user = opts.user;
			
			if (opts.data) {
				this.set_models(opts.data);
			}					
			
			Backbone.trigger(this.type + 'sCollected', this.models);
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
});
	
