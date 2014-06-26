//OPTIONS

	var Option = Backbone.Model.extend({
		defaults: {
			menu: '',
			price: '',
			name: ''
		},
		urlRoot: restful.url + '/options'
	});
	
	var Options = Backbone.Collection.extend({
		model: Option,
		url: restful.url + '/options'
	});
