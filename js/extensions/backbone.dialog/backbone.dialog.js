define(
	[
		'jquery', 
		'underscore', 
		'backbone', 
		null, //'hbs!extensions/backbone.dialog/templates/dialog', 
		'modal'
	], 
	function(
		$, 
		_, 
		Backbone, 
		template, 
		Modal
	) {
	return Backbone.View.extend({
		template: template,
		initialize: function(attrs, opts) {
			attrs = attrs || {};
			attrs['submitClass'] = attrs['submitClass'] + " tag-button" || "tag-button";  
			attrs['class'] = attrs['class'] + " dialogForm" || "dialogForm";  
			this.render(attrs, opts);			
		},
		
		render: function(context, opts) {				
			var html;
			if (template != null) {
				html = template(context);
			} else {
				$container = $('<div>');
				$form = $('<form>', {id: context.id, class: context.class});
				_.each(context.fields, function(el, i, li) {
					$label = $('<label>', {class: 'tag-label', for: el.field.attr('name'), text: el.label});					
					$div = $('<div>');
					$div.append($label);
					$div.append(el.field);
					$form.append($div);
				}, this);
				$button = $('<button>', {class: "dialogButton " + context.submitClass, id: context.submitId, text: context.submitText});
				$form.append($button);
				$container.append($form);
				html = $container.html();
			}

			Modal.setModalProperties({overflow: "hidden", margin: "auto"});
			Modal.openDomDocument(html);
			
			$('#' + context.submitId).click(function(event) {
				$form = $('#' + context.id);
				console.log('Form', $form);
				var f_data_obj = $form.serializeArray();
				console.log("Form Submit", f_data_obj);
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