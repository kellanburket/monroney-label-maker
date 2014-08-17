define(['jquery', 'underscore', 'backbone', 'hbs!extensions/backbone.dialog/templates/dialog', 'modal'], function($, _, Backbone, template, Modal) {
	//console.log('Handlebars', Handlebars);
	return Backbone.View.extend({
		template: template,
		initialize: function(attrs, opts) {
			attrs = attrs || {};
			attrs['submitClass'] = attrs['submitClass'] + " tag-button" || "tag-button";  
			attrs['class'] = attrs['class'] + " dialogForm" || "dialogForm";  
			this.render(attrs, opts);			
		},
		
		render: function(context, opts) {				
			//var source = Handlebars.compile(template);
			var html = template(context);
			Modal.setModalProperties({overflow: "hidden", margin: "auto"});
			Modal.openDomDocument(html);
			
			$('#' + context.submitId).click(function(event) {
				var f_data_obj = $('#' + context.id).serializeArray();
				event.preventDefault();
				event.stopPropagation();
	
				var post_data = {};
				
				var allFieldsFilledIn = true;
								
				for(var i in f_data_obj) {
					if (!f_data_obj[i].value) {
						$thing = $('[name="' + f_data_obj[i].name + '"]');
						
						if ($thing.hasClass('nonmandatory')) {
							continue;
						}
						$thing.animate({backgroundColor: '#bf2026'}, {duration: 600});
						$thing.click(function() {
							$(this).css('backgroundColor', '#ffffff');
						});
						allFieldsFilledIn = false;
					} else {
						post_data[f_data_obj[i].name] = f_data_obj[i].value;
					}
				}
	
				if (!allFieldsFilledIn) {
					return false; 
				} else {
					opts.callback.call(opts.context, post_data);
				}
			});
			
		}	
	});
});	