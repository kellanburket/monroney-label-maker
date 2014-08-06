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
	$close = $('<div id="modal-close" href="">x</div>');
	
	$modal.css({visibility: 'hidden'});
	$overlay.hide();
	$modal.append($content, $close);

	$(document).ready(function() {
		$('body').append($overlay, $modal);
	});
	
	method.handle = function() {
		$overlay.click(method.close);
		$close.click(method.close);
		$('.ok-button').click(method.close);			
	};
	
	method.overlay = function(settings) {
		$overlay.addClass(settings.overlayClass);
		$(settings.parent).append($overlay);
	};
	
	method.displayMessage = function(text, clz) {
		method.replaceContent('h3', {text: text, class: clz});			
		method.appendContent('button', {text: 'OK', class:'tag-button ok-button'});
		method.show();
	}
	
	
	//Append a new html tag item to the content
	method.appendContent = function (tag, options) {
		$new_content = $('<' + tag + '>', options);
		$content.append($new_content);	
		method.adjustDimensions();
	};

	//Empty content and replace with new html element
	method.replaceContent = function (tag, options) {
		$new_content = $('<' + tag + '>', options);
		$content.empty().append($new_content);	
		method.adjustDimensions();
	};

	method.adjustDimensions = function() {
		var w = $content.width();
		var h = $content.height();
		$modal.width(w + 20);
		$modal.height(h + 40);	
	}


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
		method.appendContent(tag, options);		
		method.show(modal_animation);
	};

	method.show = function(animation, properties) {
		method.hideLoader();
		
		$modal.append($content);
		animation = animation || {};
		properties = properties || {};

		$overlay.show();				
		$modal.css({visibility: 'visible'});
		$overlay.css({background: 'black'}, {opacity: 0});
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
		
		method.handle();
	}
	
	method.hideLoader = function() {
		$loader.detach();
		$content.css({opacity: 1});	
	};
	
	method.showLoader = function(settings) {
		$modal.append($loader);
		$content.css({opacity: .1});	
		method.show();
	};
	
	method.close = function() {
		console.log('Method Close');
		$modal.css({visibility: 'hidden'});
		$modal.removeClass('modalIsOpen');
		$overlay.css({opacity: 1, background: "none"});
		$content.empty();
		$overlay.hide();
		$close.unbind('click');
		$overlay.unbind('click');		
	};
	
	return method;
}(jQuery));