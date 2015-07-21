$.widget("custom.animationProgressBar", $.ui.slider, {

    options: {
        mouseIsDown: false
    },

    _create: function(options) {
        //console.log("create");

        this._mouseInit();
        return this._super(options);
    },

    _mouseStart: function() {
        this.options.mouseIsDown = true;
        //console.log("mouse is down");
        this._super();
    },

    _mouseStop: function(event) {
        this.options.mouseIsDown = false;
        //console.log("mouse is up");
        this._super(event);
    },

    _setOption: function( key, value ) {
        if ( key === "value" && !this.options.mouseIsDown) {
            //console.log("mouse is not down");
            //value = this._constrain( value );
            this._super( key, value );
        } else if(key !== "value") {
            this._super( key, value );
        }

    },
    _setOptions: function( options ) {
        this._super( options );
    }


});