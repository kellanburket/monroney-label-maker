var Modal = (function($){
	var method = {}, $overlay, $modal, $content, $close, $loader;
		
	var scripts = document.getElementsByTagName("script");
    var src = scripts[scripts.length-1].src;
	var index = src.lastIndexOf("/");
	var path = src.substr(0,index);
	
	$overlay = $('<div id="overlay"></div>');
	$modal = $('<div id="modal"></div>');

	$loader = $('<img id="page-loader" class="snakeskin-loader" src="' + path + '/loader.gif">');
	$content = $('<div id="modal-content"></div>');
	$close = $('<div id="modal-close" href="">close</div>');
	
	$modal.hide();
	$overlay.hide();
	$modal.append($content, $close);

	$(document).ready(function() {
		$('body').append($overlay, $modal);
	});
	
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
	
	method.overlay = function(settings) {
		$overlay.addClass(settings.overlayClass);
		$(settings.parent).append($overlay);
	
	};
	
	method.displayMessage = function(text, clz) {
		method.hideLoader();
		method.replaceContent('h3', {text: text, class: clz});			
		method.appendContent('button', {text: 'OK', class:'tag-button ok-button'});
		method.show();
		$('.ok-button').click(method.close);			
	}
	
	method.appendContent = function (tag, options) {
		$new_content = $('<' + tag + '>', options);
		$content.append($new_content);	
		var w = $content.width();
		var h = $content.height();
		method.adjustDimensions(w, h);
	};


	method.adjustDimensions = function(w, h) {
		$modal.width(w + 20);
		$modal.height(h + 40);	
	}

	method.replaceContent = function (tag, options) {
		method.hideLoader();
		$new_content = $('<' + tag + '>', options);
		$content.empty().append($new_content);	
		var w = $content.width();
		var h = $content.height();
		method.adjustDimensions(w, h);
	};

	method.animateDimensions = function() {
		$modal.animate({width: 0, height: 0}, {duration: 200}).done(function() {
			$modal.animate({width: w, height: h}, {duration: 400});
		});
	}
	
	method.setContentProperties = function (prop) {
		$content.css(prop);
	};
	
	method.setModalProperties = function (prop) {
		$modal.css(prop);
	};
	
	method.animate = function (properties, duration, easing) {
		
		easing = easing || 'swing';
		duration = duration || 400;
		
		var inner_w = parseInt(window.innerWidth);
		var inner_h = parseInt(window.innerHeight);
		
		
		if (parseInt(properties.width) > inner_w + 100) {
			properties.width = inner_w - 100;
			properties.overflow = "hidden";
		}

		if (parseInt(properties.height) > inner_h + 100) {
			properties.height = inner_h - 100;
			properties.overflow = "hidden";
		}
		
		console.log('Modal.Animate', properties, duration, easing);
		
		$modal.animate(properties, {duration: duration, easing: easing});
		//$content.animate(content_properties, {duration: duration, easing: easing});
	}
	
	method.openDomDocument = function (doc, options, modal_animation) {
		method.hideLoader();
		
		$content.empty().append(doc);	
		//console.log('ModalAppend', $content);
		method.show(modal_animation);
	}
	
	method.open = function (tag, options, modal_animation) {
		method.hideLoader();
		method.appendContent(tag, options);		
		method.show(modal_animation);
	};

	method.show = function(animation, properties) {
		$modal.append($content);
		animation = animation || {};
		properties = properties || {};

		$overlay.show();				
		$modal.show();
		
		var overlay_animation = {opacity: .7};
		$overlay.animate(overlay_animation, {duration: 400});	
		
		
		if (animation.length > 0) {
			console.log('animate', animation);
			animation['opacity'] = animation['opacity'] || 1;
			animation['height'] = animation['height'] || $content.height() + 50;
			animation['width'] = animation['width'] || $content.width();
			
			$modal.animate(modal_animation, {duration: 400});
		} else {
			
			width = properties.width || $content.width();
			height = properties.height || $content.height() + 50;
			console.log('properties', properties, width, height);

			$modal.css({opacity: 1, height: height, width: width});	
		}
		
		$overlay.click(method.close);
		$close.click(method.close);
	}
	
	method.appendToTarget = function(target, parent, settings) {
		$(target).appendTo($overlay);
		
		$overlay.append($modal);
		
		settings.content = $loader;
		settings.parent = parent;
		console.log($overlay, settings);

		method.overlay(settings);
	};
	
	method.hideLoader = function() {
		$loader.detach();
		$content.css({opacity: 1});	
	};
	
	method.showLoader = function(settings) {
		if (!$modal.is(':visible')) {
			method.show();
		}
		$modal.append($loader);
		$content.css({opacity: .1});	
	};
	
	method.close = function() {
		console.log('Method Close');
		$modal.hide();
		$modal.removeClass('modalIsOpen');
		$overlay.css({opacity: 1, background: "none"});
		$content.empty();
		$overlay.hide();
		$close.unbind('click');
		$overlay.unbind('click');		
	};
	
	return method;
}(jQuery));