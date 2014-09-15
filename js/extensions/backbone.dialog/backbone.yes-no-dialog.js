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
		initialize: function(attrs, opts) {
			this.render(attrs, opts.yesCallback, opts.noCallback);			
		},
		
		render: function(message, yesCallback, noCallback) {				
			var html;
			html = template(message);
			console.log("Yes No Dialog", message);
			Modal.setModalProperties({overflow: "hidden", margin: "auto"});
			Modal.openDomDocument(html);
			
			$('.dialogYes').one('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				yesCallback.call();
			});

			$('.dialogNo').one('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				noCallback.call();
			});
			
		}	
	});
	
	var initialize = function(message, yes, no) {
		return new Dialog({message: message}, {yesCallback: yes, noCallback: no});
	};
	
	return {initialize: initialize};
	
});	