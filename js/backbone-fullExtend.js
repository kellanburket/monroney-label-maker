(function(Model){
    'use strict';
    // Additional extension layer for Models
    Model.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = Model.extend.call(this, protoProps, staticProps);
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

})(Backbone.Model);

(function(View){
    'use strict';
    // Additional extension layer for Views
    View.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = View.extend.call(this, protoProps, staticProps);
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

})(Backbone.View);