define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	return Backbone.Model.extend({
		defaults: {
			user: null,
			id: null,
			name: null,
			labelColor: '#23498a',
			stockNo: '',
			
			fontStyle: 'normal',
			fontWeight: 'normal',
			_fontWeight: 'normal',
			_fontStyle: 'normal',
			fontFamily: 'sans-serif',
			
			dealershipName: '[Dealership Name]',
			dealershipTagline: '[Tagline]',
			additionalInfo: '[Additional Info]',
			_dealershipName: '[Dealership Name]',
			_dealershipTagline: '[Tagline]',
			_additionalInfo: '[Additional Info]',
			
			dealershipLogo: null,
			dealershipLogoId: null,
			customImage: null,
			customImageId: null,	
			
			make: '',
			make_id: '',

			model: '',
			model_id: '',
			
			year: new Date().getFullYear(),
			year_id: '',
			
			trim: '',
			vin: '',
			mrsp: '',
			
			optionsInterior: [],
			optionsExterior: [],
			
			optionIds: [],
			discountIds: [],
			optionPrices: {},
			
			discounts: [],
			
			displayLogo: false,
			
			total: 0.00,
		},
				
		initialize: function(attrs, opts) {
			this.listenTo(Backbone, 'modelUpdated', this.set_model);
			this.listenTo(Backbone, 'yearUpdated', this.set_year);
			this.listenTo(Backbone, 'makeUpdated', this.set_make);

			this.listenTo(Backbone, 'msrpUpdated', this.set_msrp);
			this.listenTo(Backbone, 'trimUpdated', this.set_trim);
			this.listenTo(Backbone, 'vinUpdated', this.set_vin);
			this.listenTo(Backbone, 'stockNoUpdated', this.set_stock_no);
			
			
			this.listenTo(Backbone, "selectImage", this.set_image);
			this.listenTo(Backbone, "makeSelected", this.set_make_id);
			this.listenTo(Backbone, "modelSelected", this.set_model_id);
			this.listenTo(Backbone, "yearSelected", this.set_year_id);
			this.listenTo(Backbone, "requestReset", this.reset_attributes);

			this.on("change:user", function(model, name) {
				var old_user = model.previous("user");
				if (old_user != null) {
					old_user.stopListening();
				}
			});
		},

		set_all_attributes: function() {
			for(var name in this.attributes) {
				this.set(name, this.attributes[name]);
			}
		},

		set_image: function(clz, model) {
			var id = model.get('id');
			var guid = model.get('guid');
			
			console.log('Set Featured Image', model, id);
			this.set(clz, guid);
			this.set(clz + 'Id', id);
		},

		get_total: function() {
			var total = this.get('total');
			return parseFloat(Math.round(total * 100) / 100);
		},

		get_change: function() {
			var changes = this.changedAttributes()
			for (i in changes) {
				return {key: i, value: changes[i]};
			}
		},

		add_option: function(id, price) {
			console.log("LABEL:Add Option", this.attributes);
			this.attributes.optionIds.push(id);
			this.attributes.optionPrices[id] = price;
		},

		remove_option: function(id, price) {
			var index = this.attributes.optionIds.indexOf(id);		
			this.attributes.optionIds.splice(index, 1);
			delete this.attributes.optionPrices[id];		
		},
		
		set_model_id: function(id) {
			this.set('model_id', id);
		},

		set_make_id: function(id) {
			this.set('make_id', id);
		},

		set_year_id: function(id) {
			this.set('year_id', id);
		},

		set_model: function(name) {
		//console.log('Set Model', name);
			this.set('model', name);
		},

		set_make: function(name) {
		//console.log('Set Make', name);
			this.set('make', name);
		},

		set_year: function(year) {
		//console.log('Set Year', year);
			this.set('year', year);
		},

		set_msrp: function(msrp) {
		//console.log('Set MSRP', msrp);
			this.set('msrp', parseFloat(Math.round(msrp * 100)/100).toFixed(2));
		},

		set_vin: function(vin) {
		//console.log('Set VIN', vin);
			this.set('vin', vin);
		},

		set_stock_no: function(stock_no) {
		//console.log('Set Stock No', stock_no);
			this.set('stockNo', stock_no);
		},

		set_trim: function(trim) {
		//console.log('Set Trim', trim);
			this.set('trim', trim);
		},

		get_msrp: function() {
			return parseFloat(Math.round(this.get('msrp') * 100) / 100);
		},
		
		reset_attributes: function() {
			Backbone.trigger('labelReset');
			for(var name in this.attributes) {
				this.set(name, '');
			}
		},
	});	
});
	