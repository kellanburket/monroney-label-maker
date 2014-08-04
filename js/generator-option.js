//OPTIONS

var Option = Backbone.Model.extend({
	defaults: {
		location: '',
		price: 0.00,
		option_name: ''
	},
	initialize: function(attrs, opts) {
		this.url = attrs.url;
	},
});

var Options = Backbone.Collection.extend({
	model: Option,
	initialize: function(opts, attrs) {
		console.log('New Options Collection', opts, attrs);
		this.url = attrs.url;
		this.location = attrs.location;
	},
	create: function(attributes, options) {						
		options = (!options) ? {} : options;
		if (!attributes) {
			return false;
		}
		options['url'] = this.url;
		attributes['location'] = this.menu;
		
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

var OptionsList = Backbone.View.extend({
	defaults: {
	},
	initialize: function(attrs, opts) {
		
		
		this.collection = attrs.collection;
		this.input_container = attrs.input_container;
		this.add_item = attrs.add_item;
		this.save_button = attrs.save_button;
		this.input = attrs.input;
		this.list_items =  {};
		this.listenTo(Backbone, 'requestOptions', this.fetch_options);
		this.render(attrs.el);
	},
	
	fetch_options: function(ids, prices) {
		//var filtered_collection = [];
		
		for (var i = 0; i < ids.length; i++) {
			//Backbone.trigger(
			var model = this.collection.findWhere({id: ids[i]});
			Backbone.trigger('add_option', model, prices[ids[i]]);
			//);
			//filtered_collection.push();		
		}
		
		//Backbone.trigger('returnOptions', filtered_collection);
	},
	
	render: function(el) {
		this.el = el;
		this.$el = $(this.el);
		$(this.add_item).click($.proxy(this.show_input, this));
		$(this.save_button).click($.proxy(this.add_new_option, this));
		this.listenTo(this.collection, "add", this.render_list_item);	
		for (i in this.collection.models) {
			this.render_list_item(this.collection.models[i], this.collection);
		}
	},
	render_list_item: function(model, collection, options) {
		console.log('Rendering a Model', model);
		this.list_items[model.id] = new OptionsListItem({model: model});	
		this.list_items[model.id].render(this);
	},
	show_input: function() {
		console.log('Click');
		Backbone.trigger('requestUserId', this);
		this.listenToOnce(Backbone, 'returnUserId', function(id) {
			$(this.input_container).removeClass('invisible');
			$(this.add_item).addClass('invisible');
			$(this.input).focus();
		});
		
	},
	add_new_option: function() {
		console.log("Collection", this.collection);
		var new_option_name = $(this.input).val();
		$(this.input).val('');
		$(this.input_container).addClass('invisible');
		$(this.add_item).removeClass('invisible');
		$(this.save_button).hide();		
		this.collection.create({option_name: new_option_name, location: this.collection.location});
	}
	
});

var OptionsListItem = Backbone.View.extend({
	tag: "li",
	initialize: function(attrs, opts) {
	},

	render: function(parent) {
		$root = $('<' + this.tag + '>');
		$checkbox = $('<input>', {type: 'checkbox', class: 'tag-checkbox'});
		$name = $('<span>', {text: this.model.get('option_name')});
		$price_wrap = $('<div>', {class: 'option-price float-right'});
		$dollar = $('<span>', {text: '$ '});
		this.$price_input = $('<input>', {type: 'text', class: 'tag-input', text: this.model.get('price')});
		$price_wrap.append($dollar, this.$price_input);
		$root.append($checkbox, $name, $price_wrap);
		
		$(parent.el).prepend($root);
		this.el = $(parent.el).children('li')[0];
		this.$el = $(this.el);
		this.$checkbox = this.$el.children(':checkbox');
	
		//console.log('Price', this.$price_input.val());
	
		var item = this;
		this.$checkbox.change(function() {
			var checked = $(this).prop('checked');
			if (checked) {
				Backbone.trigger('add_option', item.model, item.$price_input.val());	
			} else {
				Backbone.trigger('remove_option', item.model, item.$price_input.val());	
			}
		});
		return this;	
	}
});