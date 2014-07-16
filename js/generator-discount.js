	var Discount = Backbone.Model.extend({
		defaults: {
			type: '',
			discount: '',
			amount: 0
		},
		initialize: function(attrs, opts) {
			console.log('New Discount', this);
		}
	});	


	var Discounts = Backbone.Collection.extend({
		model: Discount,
		initialize: function(attrs, opts) {
			_.each(attrs, function(element, index, list) {
				var discount = new Discount(element);
				console.log(discount);
				this.add(discount);		
			}, this);
			
			this.model = Discount;
			this.url = restful.url + "discounts";
		},

		create: function(attributes, options) {						
 			console.log("New Discount", this, attributes, options);
 			options = (!options) ? {} : options;
			if (!attributes) {
				return false;
			}
			options['url'] = this.url;
			
			var new_options = {}
			var that = this;
			var new_model = new this.model(attributes, options);
				
			new_options['success'] = function(collection, response, xhr) {
				var json_response = $.parseJSON(xhr.responseText);
					if (json_response.success = true) {
						console.log('Success', json_response);
						that.add(new_model);
					} else if(json_response.message = "Already Added") {
						console.log("Already Added", json_response);
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
			new_options['processData'] = true;
	
			for (i in options) {
				new_options[i] = options[i];
			}
			console.log("OptionSync", new_model, new_options);
			return Backbone.sync('create', new_model, new_options);
		}		
	});

	var DiscountItem = Backbone.View.extend({
		class: 'discountListItem',
		tag: 'li',
		initialize: function() {
			return this.render();
		},
		render: function() {
			this.el = $("<" + this.tag + ">", {class: this.class + " striped-list"});
			$ul = $('<ul>', {class: 'inline-list'});
			$checkbox = $('<input>', {type: 'checkbox', class: 'tag-checkbox'});
			$discount = $('<li>', {text: this.model.get('discount')});
			$type = $('<li>', {text: "(" + this.model.get('type') + ")"});
			$amount = $('<li>', {text: "$" + parseFloat(Math.round(this.model.get('amount') * 100) / 100).toFixed(2), class: 'float-right'});

			$ul.append($checkbox, $discount, $type, $amount);
			this.el.append($ul);
			
			var item = this;
			$checkbox.change(function() {
			console.log($(this));
				var checked = $(this).prop('checked');
				console.log('Checked', checked);
				if (checked) {
					Backbone.trigger('add_discount', item.model);	
				} else {
					Backbone.trigger('remove_discount', item.model);	
				}										
			});
			return this;			
		}
	});

	var DiscountList = Backbone.View.extend({
		initialize: function(attrs, opts) {
			this.list_items = {};
			this.listenTo(this.collection, "add", this.render_new_list_item);		
			this.render(attrs.el);
		},
		render: function(el) {
			this.el = el;
			this.$el = $(this.el);
			_.each(this.collection.models, function(element, index, list) {
				this.render_new_list_item(element, this.collection, {});				
			}, this);
		},
		render_new_list_item: function(model, collection, options) {
			console.log('DiscountList:addItem', this);
			var view = new DiscountItem({model: model});
			this.list_items[model.get('discount')] = view;
			this.$el.prepend(view.el);
		}
	});
	
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
			console.log("Add New Discount(Controls)", this);
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
