define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	return function() {
		this._queue = [];
		
		this.push = function(collection, attributes) {
			//console.log('add_to_queue:', collection, attributes);
			this._queue.push({collection: collection, attributes: attributes});			
		};
		
		this.shift = function(id, collection) {

			var object = this._queue.shift();
			var attributes = object.attributes;

			for(i in id) {
			 attributes[i] = id[i];
			}
			////console.log('queue.shift', object, collection, attributes);
			collection = (!collection) ? object.collection : collection;
			
			//console.log('queue.shift', collection, attributes);
			
			collection.create(attributes);
		}
		this.length = function() {
			return this._queue.length;
		}
		this.add_all = function() {
			////console.log('queue', this._queue);
			this._recursive_add(this._queue.shift()).fail(function() {
				//console.log('Recursive Function Failed');
			});
		};
		
		this._recursive_add = function(obj) {
			////console.log('Queue Length', this._queue.length);
			if (obj) {				
				var attr = obj.attributes;
				var coll = obj.collection;
				//console.log('_recursive_add', attr, coll); 
				return $.Deferred($.proxy(function(attr, collection) {
					//console.log('Deffered Return', attr);	
					return collection.create(attr);
				}, null, attr, coll))
				.promise()
				.then(this._recursive_add(this._queue.shift()));
			} else {
				return $.Deferred().promise();
			}
		};
	};
});