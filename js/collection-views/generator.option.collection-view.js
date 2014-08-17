define(['jquery', 'underscore', 'backbone', 'option-view'], function($, _, Backbone, OptionListItem) {

	var OptionsList = Backbone.View.extend({
		initialize: function(attrs, opts) {
			//console.log("New Options List", this.collection.userId);
			this.collection = attrs.collection;
			this.input_container = attrs.input_container;
			this.add_item = attrs.add_item;
			this.save_button = attrs.save_button;
			this.input = attrs.input;
			this.price_input = attrs.price_input;
			this.list_items = {};
			this.render();
		},
		
		fetch_options: function(ids, prices) {
			for (var i = 0; i < ids.length; i++) {
				var model = this.collection.findWhere({id: ids[i]});
				//console.log('fetch ' + this.collection.location + ' options', this.collection.userId);		
				if (model != null) {
					Backbone.trigger('add_option', model, prices[ids[i]]);
				}
			}
		},
		
		render: function() {
			//console.log("Rendering Options", this.collection.location, this.collection.userId);
			this.stopListening();
	
			this.listenTo(this.collection, "add", this.render_list_item);	
	
			var ucLocation = this.collection.location.charAt(0).toUpperCase() + this.collection.location.substr(1, this.collection.location);
	
			this.listenTo(Backbone, this.collection.location + "OptionsAdded", this.replace_collection);
			this.listenTo(Backbone, 'requestOptions', this.fetch_options);
	
			$(this.add_item).off('click');
			$(this.add_item).on('click', $.proxy(this.show_input, this));
	
			$(this.save_button).off('click');
			$(this.save_button).on('click', $.proxy(this.add_new_option, this));
			
			for (i in this.collection.models) {
				this.render_list_item(this.collection.models[i], this.collection);
			}
		},
		
		replace_collection: function(collection) {
			console.log("Replace " + this.collection.location + " Options Collection", this.collection.userId);
			this.collection.stopListening();
			this.collection = collection;
			this.render();	
		},
		
		render_list_item: function(model, collection, options) {
			console.log('Rendering an Option', model.get('optionName'));
			this.list_items[model.id] = new OptionsListItem({model: model});	
			this.list_items[model.id].render(this);
		},
		show_input: function() {
			console.log("Show Input Collection", this.collection.location, this.collection.userId);
			this.listenToOnce(Backbone, 'returnUserId', function(id) {
				$(this.input_container).removeClass('invisible');
				$(this.add_item).addClass('invisible');
				$(this.input).focus();
			});
			Backbone.trigger('requestUserId', this);		
		},
		add_new_option: function() {
			var new_option_name = $(this.input).val();
			var new_option_price = $(this.price_input).val(); 
			var location = this.collection.location;
			console.log("New Option For Collection", new_option_name, new_option_price, location);
	
			$(this.price_input).val('');
			$(this.input).val('');
			$(this.input_container).addClass('invisible');
			$(this.add_item).removeClass('invisible');
	
			console.log("OptionsView:addNewOption",  this.collection.userId, new_option_name, new_option_price, location);
	
			this.collection.create(
				{
					optionName: new_option_name, 
					price: new_option_price,
					location: location
				}
			);
		}
		
	});	

	var initialize = function(attrs, opts) {
		return new OptionsList(attrs, opts);	
	}
	
	return {initialize: initialize};
});