define(['jquery', 'underscore', 'backbone', 'app'], function($, _, Backbone, App) {

	//console.log("In the Router");

	var Workspace =	Backbone.Router.extend({
		routes: {
			"branding_options": "branding_options",
			"vehicle_info(/:make/:model/:year)": "vehicle_info",
			"addendum_options": "addendum_options",
			"discounts_and_deals": "discounts_and_deals"
		},
		initialize: function() {
			var router = this;		
			$('.tag-tab-holder').click(function() {
				var name = $(this).attr('name');
				router.navigate(name, {trigger: true});
			});
		},
		branding_options: function() {
			this.toggle(0);
		},
		vehicle_info: function(make, model, year) {
			if (make) {
				$('[name=make]').val(make);			
			}
			if (model) {
				$('[name=model]').val(model);						
			}
			if (year) {
				$('[name=year]').val(year);						
			}
	
			this.toggle(1);
		},
		addendum_options: function() {
			this.toggle(2);
		},
		discounts_and_deals: function() {
	
		},
		
		toggle: function(index) {
			//console.log(index);
			$('.tag-tab-holder').addClass('inactive');	
			$('.tag-frame').addClass('invisible');
			
			$('.tag-tab-holder').removeClass('active');	
				
			$('#tag-tab-holder-' + index).toggleClass('inactive active');
			$('#tag-frame-' + index).toggleClass('invisible');
		}
	});
	
	var initialize = function(){
	    var app_router = new Workspace;
		App.initialize();
	    Backbone.history.start();
	};
	
	return {
		initialize: initialize
	};
});