(function() {
	require.config({
		//Cache-Busting
		urlArgs: "bust=" + (new Date()).getTime(),
		paths: {
			'dropzone': 'lib/dropzone/dropzone',
			'hbs': 'lib/require-handlebars-plugin/hbs',
			'pdf': 'lib/pdf.js/build/generic/build/pdf',
			'comptability': 'lib/pdf.js/build/generic/web/compatibility',			
			'underscore': 'lib/underscore/underscore',
			'backbone-original': 'lib/backbone/backbone',
			'backbone': 'extensions/backbone.extensions',
			'dialog': 'extensions/backbone.dialog/backbone.dialog',
			'combo': 'extensions/backbone.combo/backbone.combo',
			'extended-collection': 'extensions/backbone.extended-collection/backbone.extended-collection',
			'controls': 'views/generator.controls.view',
			'label-view': 'views/generator.label.view',
			'label-option-view': 'views/generator.label.option.view',
			'label-discount-view': 'views/generator.label.discount.view',
			'label': 'models/generator.label.model',
			'labels': 'collections/generator.label.collection',
			'img': 'models/generator.img.model',
			'imgs': 'collections/generator.img.collection',
			'img-view': 'views/generator.img.view',
			'imgs-view': 'collection-views/generator.img.collection-view',
			'vehicle': 'models/generator.vehicle',
			'vehicle-make': 'models/generator.vehicle.make.model',
			'vehicle-model': 'models/generator.vehicle.model.model',
			'vehicle-year': 'models/generator.vehicle.year.model',
			'vehicle-type': 'collections/generator.vehicle.type.collection',
			'vehicle-stat': 'views/generator.vehicle.stat.view',
			'vehicle-option': 'views/generator.vehicle.option.view',
			'vehicle-select': 'views/generator.vehicle.select.view',
			'vehicle-input': 'views/generator.vehicle.input.view',
			'vehicle-view': 'views/generator.vehicle.view',
			'option': 'models/generator.option.model',
			'options': 'collections/generator.option.collection',
			'option-view': 'views/generator.option.view',
			'options-view': 'collection-views/generator.option.collection-view',
			'discount': 'models/generator.discount.model',				
			'discounts': 'collections/generator.discount.collection',				
			'discount-view': 'views/generator.discount.view',				
			'discounts-view': 'collection-views/generator.discount.collection-view',				
			'generic-controls': 'controllers/generator.generic.controller',
			'user': 'models/generator.user.model',					
			'workspace': 'generator.workspace',			
			'app': 'generator.app',
			'crypto-js': 'lib/node_modules/crypto-js/',
			'modal': 'lib/modal/modal',			
			shim: {
			    'backbone': {
	            	deps: ['underscore', 'jquery'],
					exports: 'Backbone'
				},
				'underscore': {
	            	exports: '_'
	            }
	        }
	    }
	});	


	if (typeof jQuery === 'function') {
		define('jquery', function () { 
			return jQuery; 			
		});
	}

	define(['jquery', 'underscore', 'backbone', 'workspace'], function($, _, Backbone, Workspace) {
		console.log("Workspace", Workspace);
		return Workspace.initialize();  	
  	});
  		
})();