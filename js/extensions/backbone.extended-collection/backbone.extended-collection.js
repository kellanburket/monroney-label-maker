define(['jquery', 'underscore', 'backbone', 'uniqid', 'crypto-js/enc-base64', 'crypto-js/hmac-sha1'], function($, _, Backbone, uniqid, Base64, HmacSHA1) {
	return Backbone.Collection.extend({
		set_user_id: function(user) {
			this.user = user;
			//console.log("Current User", this.user.get('name') + "(" + this.user.get('id') + ")");
		},
		
		set_listeners: function() {
			this.listenTo(Backbone, "userLoggedIn", this.set_user_id);
		},
		
		create: function(attributes, options) {						
 			if (!attributes) return false;
				
			options = options || {};
		
			if (!options['url']) {
				if (typeof this.url === 'function') {
					options['url'] = this.url();
				} else {
					options['url'] = this.url;
				}
			}
			var new_model = new this.model(attributes, options);

			//console.log("New Model:attributes", attributes);
			//console.log("New Model:options", options);			
			//console.log("New Model", new_model);
 			var new_options = {};
			new_options['data'] = {};
				
			for (i in attributes) {
				new_options['data'][i] = new_model.get(i);
				new_options['data'] = this.camelToSnakeCase([new_options['data']])[0];	
			}
			new_options['data'] = JSON.stringify(new_options['data']);			
			new_options['dataType'] = 'json';
			new_options['processData'] = false;
			new_options['contentType'] = 'application/json';
			
			//var success = options['success'] || function(){};
			//var error = options['error'] || function(){};

			new_options['success'] = $.proxy(function(data, response, xhr) {
				if (typeof data === "string") {
					data = $.parseJSON(data);
				}
	
				if (data.success == true) {
					console.log('Success', data);
					new_model.set('id', data.id);

					this.add(new_model);
				} else if(data.message == "Already Added") {
					console.log("Already Added", json_response);
				} else {
					console.log("Unsuccessful", data);
				}
				//success(data, response, xhr);
			}, this);

			new_options.error = function(data, response, xhr) {
				console.log("Failure", data, response, xhr);
			};

			for (i in options) {
				if (options[i]) {
					new_options[i] = options[i];
				}
			}		
			var nonce = uniqid(5);
			var msg = "POST+" + new_options['url'] + "+" + nonce;
			//console.log("Message", msg);
			//console.log("Secret", this.user.get('secret'));
			var hash = HmacSHA1(msg, this.user.get('secret'));
			//console.log("Hash", hash.toString());
			var digest = hash.toString(Base64);							
			//console.log("Digest", digest);
			var auth_header = "hmac " + this.user.get('name') + ":" + nonce + ":" + digest;
			//console.log("Header", auth_header);
			new_options['headers'] = new_options['headers'] || {};
			new_options['headers']['Authentication'] = auth_header;					
			return Backbone.sync('create', new_model, new_options);
		},
		
		parse: function(snake, options) {
			var camel = this.snakeToCamelCase(snake);
			
			var camels = [];
			_.each(camel, function(el, i, li) {
				camels.push(el);
			}, this);
			//console.log('Parse', snake, camel, camels, options);
			return camels;
		},
		
		
		camelToSnakeCase: function (camels) {
    		var snakes = []
			//console.log('SNAKES', snakes);
			for (var i in camels) {
				snakes.push(this._recursiveCamels(camels[i]));
			}
			//console.log('SnakeCamel', snakes);
			return snakes;
		},
		
		_recursiveCamels: function(camels, isValue) {
			if (typeof camels == 'string') {
				//console.log('SnakeCamel:string', camels, isValue);
				isValue = isValue || false;
				//Check if function is returning a url or file
				if (camels.match(/.*\.[a-zA-Z0-9]{3,4}$/)) {
					return camels;				
				} else if (isValue == true) {
					return camels;
				}
				
				return camels.replace(/([A-Z])/, function(match, horse) {
					return '_' + horse.toLowerCase();
				});
			} else if (typeof camels == 'object') {
				snake = {};
				for (var key in camels) {
					if (camels[key] != null) {
						//console.log('SnakeCamel:object', key, camels[key]);
						snake[this._recursiveCamels(key)] = this._recursiveCamels(camels[key], true);
					}
				}
				return snake;				
			} else if (typeof camels == 'number') {
				//console.log('SnakeCamel:number', camels);

				return camels;
			} else {
				//return null;
				//console.log('SnakeCamel:undefined', camels);
			}
		},
		
		snakeToCamelCase: function (snakes) {
    		var camels = []
			//console.log('SNAKES', snakes);
			for (var i in snakes) {
				camels.push(this._recursiveSnakes(snakes[i]));
			}
			return camels;
		},
		
		_recursiveSnakes: function(snakes, isValue) {
			if (typeof snakes == 'string') {
				isValue = isValue || false;
				//console.log('SnakeCamel:string', snakes);
				
				if (snakes.match(/.*\.[a-zA-Z0-9]{3,4}$/)) {
					return snakes;				
				} else if (isValue == true) {
					return snakes;
				}
				return snakes.toLowerCase().replace(/_(.)/g, function(match, horse) {
					return horse.toUpperCase();
				});
			} else if (typeof snakes == 'object') {
				camel = {};
				for (var key in snakes) {
					if (snakes[key] != null) {
						//console.log('SnakeCamel:object', key, snakes[key]);
						camel[this._recursiveSnakes(key)] = this._recursiveSnakes(snakes[key], true);
					}
				}
				return camel;				
			} else if (typeof snakes == 'number') {
				//console.log('SnakeCamel:number', snakes);

				return snakes;
			} else {
				//return null;
				//console.log('SnakeCamel:undefined', snakes);
			}
		}
				
	});
});