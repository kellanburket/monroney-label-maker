//OPTIONS

var Option = Backbone.Model.extend({
	defaults: {
		location: '',
		price: 0.00,
		option_name: ''
	},
	initialize: function(attrs, opts) {
		
	},
	url: function() {
		return restful.url + '/options?location=' + this.get('location');
	}
});

var Options = Backbone.ExtendedCollection.extend({
	model: Option,
	initialize: function(opts, attrs) {
	//console.log('New Options Collection', opts, attrs);		
		this.location = attrs.location;
		this.url = attrs.url;
	
		this.on('add', function(model, collection, options) {
			model.set('location', this.location);
		});
	},
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
		this.price_input = attrs.price_input;
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
	//console.log('Rendering a Model', model);
		this.list_items[model.id] = new OptionsListItem({model: model});	
		this.list_items[model.id].render(this);
	},
	show_input: function() {
	//console.log('Click');
		this.listenToOnce(Backbone, 'returnUserId', function(id) {
		//console.log('listening');
			$(this.input_container).removeClass('invisible');
			$(this.add_item).addClass('invisible');
			$(this.input).focus();
		});
		Backbone.trigger('requestUserId', this);		
	},
	add_new_option: function() {
		var new_option_name = $(this.input).val();
		var new_option_price = $(this.price_input).val(); 

	//console.log("Collection", this.collection);

		$(this.price_input).val('');
		$(this.input).val('');
		$(this.input_container).addClass('invisible');
		$(this.add_item).removeClass('invisible');
		this.collection.create({option_name: new_option_name, price: new_option_price, location: this.collection.location});
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
		this.$price_input = $('<input>', {type: 'text', class: 'tag-input', value: this.model.get('price')});
		$price_wrap.append($dollar, this.$price_input);
		$root.append($checkbox, $name, $price_wrap);
		
		$(parent.el).prepend($root);
		this.el = $(parent.el).children('li')[0];
		this.$el = $(this.el);
		this.$checkbox = this.$el.children(':checkbox');
		
		Backbone.trigger('add_option', this.model, this.$price_input.val());
		
		//console.log('Price', this.$price_input.val());
		this.$checkbox.change($.proxy(this.set_checked, this));
		this.set_checked();
		return this;	
	},
	
	set_checked: function() {
		var checked = this.$checkbox.prop('checked');
		if (checked) {
			Backbone.trigger('add_option', this.model, this.$price_input.val());	
		} else {
			Backbone.trigger('remove_option', this.model, this.$price_input.val());	
		}
	}
	
	
});