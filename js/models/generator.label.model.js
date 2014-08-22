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
			fontFamily: 'sans-serif',
			
			dealershipName: '[Dealership Name]',
			dealershipTagline: '[Tagline]',
			
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
			if (model) {
				var id = model.get('id');
				var guid = model.get('guid');
				
				console.log('Set Featured Image', clz, guid, this.get('id'));
				this.set(clz, guid);
				this.set(clz + 'Id', id);
			} else {
				this.set(clz, null);
			}
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
				if (name != 'user') {
					switch (typeof this.attributes[name]) {
						case ("object"):
							if (this.attributes[name]) {
								if( Object.prototype.toString.call( this.attributes[name] ) === '[object Array]' ) {
									this.set(name, []);								
								} else {
									this.set(name, {});								
								}
							} else {
								this.set(name, null);
							}
							break;
						case ("undefined"):
							this.set(name, null);
							break;
						case ("number"):
							this.set(name, 0);
							break;											
						case ("boolean"):
							this.set(name, false);
							break;											
						case ("string"):
						default:
							this.set(name, '');
							break;											
					}
				}
			}
		},
	});	
});
	