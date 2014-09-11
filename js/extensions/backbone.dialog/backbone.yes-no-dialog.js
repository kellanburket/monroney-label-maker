define(
	[
		'jquery', 
		'underscore', 
		'backbone', 
		'hbs!extensions/backbone.dialog/templates/yes-no-dialog', 
		'modal'
	], 
	function(
		$, 
		_, 
		Backbone, 
		template, 
		Modal
	) {
	
	var Dialog = Backbone.View.extend({
		template: template,
		initialize: function(attrs, opts) {
			this.render(attrs, opts.yesCallback, opts.noCallback);			
		},
		
		render: function(attrs, yesCallback, noCallback) {				
			var html;
			html = template(attrs);

			Modal.setModalProperties({overflow: "hidden", margin: "auto"});
			Modal.openDomDocument(html);
			
			$('.dialogYes').one('click', function(event) {
				yesCallback.call();
			});

			$('.dialogNo').one('click', function(event) {
				noCallback.call();
			});
			
		}	
	});
	
	var initialize = function(message, yes, no) {
		return new Dialog({message: message}, {yesCallback: yes, noCallback: no});
	};
	
	return {initialize: initialize};
	
});	