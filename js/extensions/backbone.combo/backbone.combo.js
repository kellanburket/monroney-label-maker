define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	return Backbone.View.extend({
	
		initialize: function(opts) {
			//console.log("Initializing Combo", opts);
			this.select = opts.select;
			this.select.listenTo(this, 'contentEntered', this.select.auto_select);
			this.input = opts.input;
			
			this.render();
		},
	
		render: function() {
		
			var change_handle = false;
			var cursor_pos = 0;
			var key_down = 0;
			var last_key = 0;
			var combo = this;
			
			this.input.$el.change(function(event) {
				event.preventDefault();
				event.stopPropagation();
				change_handle = true;
				var number = $(this).val();
				var kind = new RegExp($(this).data('kind'), "i");
				var category = $(this).data('category');
				combo.handle_change(number, category, kind);
			});
				
			this.input.$el.click(function(event) {
				if (!change_handle) {
					$(this).val('');
					var kind = new RegExp($(this).data('kind'), "i");
					var category = $(this).data('category');	
				}
				change_handle = false;
			});
				
			this.input.$el.keyup(function(event) {
				//console.log("Key Up: " + event.which);		
				key_down = 0;
			});
			
			this.input.$el.keydown(function(event) {
				var kind = new RegExp($(this).data('kind'), "i");
				var category = $(this).data('category');
				
				var string_from_char = String.fromCharCode(event.which);
				var content = $(this).val();
				
			//console.log("keyCode(" + event.keyCode + ")", event); 
				
				switch (event.keyCode) {
					case(17): //ctrl key down
						break;	
					case(8):
						//allow cascade for this element
						if (cursor_pos > 0) {
							--cursor_pos;
							front_content = content.substr(0, cursor_pos);
							back_content = content.substr(cursor_pos + 1, content.toString().length);
							content = front_content + back_content;
							combo.handle_change(content, category, kind);
						}
						break;
					case(37):
						//console.log("KeyDown: " + key_down);
						if (event.ctrlKey) {
							cursor_pos = 0;
						} else if (cursor_pos > 0) {
							--cursor_pos;
						}
						break;
					case(38):
						content++
						cursor_pos = (content > 0) ? content.toString().length : 1;
						break;
					case(39):
						if (event.ctrlKey) {
							cursor_pos = content.length;	
						} else if (cursor_pos < content.length) {
							++cursor_pos;
						}
						break;
					case(40):
						content = (content > 0) ? content - 1 : 0;	
						cursor_pos = (content > 0) ?content.toString().length : 1;
						break;
					default:
						if (string_from_char.match(/[0-9]/)) {
							var front_content = content.substr(0, cursor_pos);
							var end_content = content.substr(cursor_pos, content.toString().length);
							content = front_content + string_from_char + end_content;		
							combo.handle_change(content, category, kind);
							++cursor_pos;
						} else {
							//console.log(event.which);
						}
				}
		
				//console.log("Cursor Position(" + cursor_pos + "), Content(" + content + ")");
			});
					
			this.input.$el.focus( function (event) {
				cursor_pos = $(this).val().toString().length;
				last_key = 0;
				key_down = 0;
			});
			
			this.input.$el.blur( function (event) {
				cursor_pos = 0;
				last_key = 0;
				key_down = 0;
			});
	
		},
		handle_change: function(content, category, kind) {
			this.trigger('contentEntered', content);
			//console.log(content + ", " + category + ", " + kind);
		}
	});
});