define(['jquery', 'underscore', 'backbone-original'], function($, _, Backbone) {
	
    Backbone.Model.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = Backbone.Model.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended._super = this.prototype;
        // Apply new or different defaults on top of the original
        if(protoProps.defaults){
            for(var k in this.prototype.defaults){
                if(!extended.prototype.defaults[k]){
                    extended.prototype.defaults[k] = this.prototype.defaults[k];
                }
            }
        }
        return extended;
    };
	
	Backbone.View.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = Backbone.View.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended._super = this.prototype;
        // Apply new or different events on top of the original
        if(protoProps.events){
            for(var k in this.prototype.events){
                if(!extended.prototype.events[k]){
                    extended.prototype.events[k] = this.prototype.events[k];
                }
            }
        }
        return extended;
    };

	return Backbone;
});