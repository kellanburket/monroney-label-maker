var Modal = (function($){
	var method = {}, $overlay, $modal, $content, $close, $loader;
		
	var scripts = document.getElementsByTagName("script");
    var src = scripts[scripts.length-1].src;
	var index = src.lastIndexOf("/");
	var path = src.substr(0,index);
	
	$overlay = $('<div id="overlay"></div>');
	$modal = $('<div id="modal"></div>');
	$loader = $('<img id="page-loader" src="' + path + '/loader.gif">');
	$content = $('<div id="modal-content"></div>');
	$close = $('<a id="modal-close" href="#">close</a>');
	
	//$modal.hide();
	//$overlay.hide();
	//$modal.append($content, $close);
	
	method.handle = function() {
		$modal
			.on("click", $content, function(event) {
				console.log('in the content');
				event.stopPropagation();
			})
			.on("click", function() {
				//console.log('anywhere else');
				modal.close();
			});
		$overlay.click( function() {
			modal.close();
		});
	};
	
	method.open = function (settings) {
		$content.empty().append(settings.content);
		$overlay.addClass(settings.overlayClass);	

		if (settings.parent) {
			$(settings.parent).append($overlay);
		} else {
			$('body').append($overlay);
		}

		$overlay.show();				
		$modal.show();
		$modal.css({opacity: 1})
	};
	
	method.appendToTarget = function(target, parent, settings) {
		$(target).appendTo($overlay);
		
		$overlay.append($modal);
		
		settings.content = $loader;
		settings.parent = parent;
		console.log($overlay, settings);

		method.open(settings);
	};
	
	method.showLoader = function(settings) {
		$('.full-page-overlay').removeClass('full-page-overlay');
		$('.page-section-overlay').removeClass('page-section-overlay');
		settings.content = $loader;
		
		method.open(settings);
	}
	
	method.close = function () {
		$modal.hide();
		$modal.removeClass('modalIsOpen');
		$overlay.css({opacity: 1, background: "none"});
		$content.empty();
	};	
	
	return method;
}(jQuery));