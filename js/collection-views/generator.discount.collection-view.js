define(['jquery', 'underscore', 'backbone', 'discount-view'], function($, _, Backbone, DiscountItem) {

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
		//console.log('DiscountList:addItem', this);
			var view = DiscountItem.initialize({model: model});
			this.list_items[model.get('discount')] = view;
			this.$el.prepend(view.el);
		}
	});
		
	var initialize = function(attrs, opts) {
		return new DiscountList(attrs, opts);	
	}
	
	return {initialize: initialize};
});