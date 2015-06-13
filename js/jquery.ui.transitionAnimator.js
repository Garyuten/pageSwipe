/*
 * $.ui.transitionAnimator / $.ui.transformAnimator
 *
 * http://code.google.com/p/jquery-ui-transitionanimator/
 * version 0.1.3 (2010/09/04)
 * Copyright (c) 2010 Takeshi Takatsudo (takazudo[at]gmail.com)
 * MIT license
 *
=============================================================================
 depends on
-----------------------------------------------------------------------------
 * jQuery 1.4.2
 * jQuery UI 1.8.2
 * jQuery UI Widget 1.8.2
 *
 */
(function($){ // start $=jQuery encapsulation

/* const */

var PROP_TRNASFORM = '-webkit-transform';
var PROP_TRANSITION = '-webkit-transition';
var EVENT_TRANSITIONEND = 'webkitTransitionEnd';

/* enhance $.support */

$.support.webkitTransition = ($.support.webkitTransition === undefined) ?  (document.getElementsByTagName('html')[0].style.webkitTransition!==undefined) : false;
$.support.webkitTransform = ($.support.webkitTransform === undefined) ?  (document.getElementsByTagName('html')[0].style.webkitTransform!==undefined) : false;
//$.support.addEventListener = ($.support.addEventListener === undefined) ?
//	Boolean(window.addEventListener) : false;

/**
 * $.ui.transitionAnimator
 */
$.widget('ui.transitionAnimator',{
	options: {
		property: null, // should be given css property name
		initVal: null
	},
	_available: true,
	_handler: null,
	_finalVal: null,
	_create: function(){
		if(!$.ui.transitionAnimator.isAvailable()){
			this._available = false;
			return this;
		}
		this._disableTransition();
		var val = this.options.initVal;
		(val!==null) && this.changeVal(val);
		return this;
	},
	isAvailable: function(){
		return this._available;
	},
	_enableTransition: function(duration, easing){
		var val = this.options.property;
		val = duration ? val + ' ' + this._millisecondsToSeconds(duration) : val;
		val = easing ? val + ' ' + easing : val;
		this.element.css(PROP_TRANSITION, val);
		//alert(val);
		return this;
	},
	_disableTransition: function(){
		this.element.css(PROP_TRANSITION,'none');
		return this;
	},
	_millisecondsToSeconds: function(milliseconds){
		return [milliseconds/1000, 's'].join('');
	},
	_cancelAll: function(){
		this.element.clearQueue();
		var fn = this._handler;
		fn && this.element.get(0).removeEventListener(EVENT_TRANSITIONEND, fn, false);
		return this;
	},
	delay: function(time){
		this.element.delay(time);
		return this;
	},
	animate: function(o){
		if(!this._available){ return this; }
		/*
			o is like this
			{
				val: value of css property,
				easing: transition easing type,
				duration: transition duration,
				before: callback before transition,
				after: callback after transition
			}
		*/
		var self = this;
		var e = self.element;
		self._finalVal = o.val;
		e.queue(function(){
			self._disableTransition();
			setTimeout(function(){
				// need zero delay because no-wait animation onload seems not working.
				self._enableTransition(o.duration, o.easing);
				var fn = self._handler = function(){
					o.after && o.after();
					self._disableTransition();
					e.unbind(EVENT_TRANSITIONEND, fn);
					self._handler = null;
					setTimeout(function(){ 
						// need zero delay to avoid ignoring animation chain
						e.dequeue();
					},1);
				};
				o.before && o.before();
				e.bind(EVENT_TRANSITIONEND, fn);
				//alert(self._getComputedVal() );
				(self._getComputedVal() == o.val) && fn();
					// if the vals are same before transition and after transition,
					// transitionEnd will not be invoked, so force invoke it here.
				self.changeVal(o.val);
			},1);
		});
		return self;
	},
	changeVal: function(val){
		if(!this._available){ return this; }
		this.element.css(this.options.property, val);
		this._finalVal = val;
		return this;
	},
	finish: function(){
		if(!this._available){ return this; }
		this.element.clearQueue();
		this._disableTransition();
		this.changeVal(this._finalVal);
		return this;
	},
	stop: function(){
		if(!this._available){ return this; }
		this._cancelAll();
		var val = this._getComputedVal();
		this._disableTransition();
		this.element.css( this.options.property, val );
		this.element.clearQueue();
		return this;
	},
	_getComputedVal: function(){
		var e = this.element.get(0);
		var prop = this._camelize(this.options.property);
		return document.defaultView.getComputedStyle(e)[prop];
	},
	_camelize: function(prop){
		return prop.replace(/-([a-z])/g, function(m, m1){
			return m1.toUpperCase();
		});
	},
	clearQueue: function(){
		this.element.clearQueue();
		return this;
	}
});

/* static */
$.ui.transitionAnimator.isAvailable = function(){
	return $.support.webkitTransition;
};

/**
 * $.ui.transformAnimator
 */
$.widget('ui.transformAnimator', $.ui.transitionAnimator, {
	options: {
		property: PROP_TRNASFORM,
		initVal: null
	},
	_translateX: null,
	_translateY: null,
	stop: function(){
		this._cancelAll();
		var val = this._getComputedTranslate3dVal()
		this._disableTransition();
		this.element.css( this.options.property, val );
		return this;
	},
	_getComputedTransformVal: function(){
		var element = this.element.get(0);
		var matrix = document.defaultView.getComputedStyle(element).webkitTransform;
		return matrix;
	},
	_getComputedTranslate3dXY: function(){
		var matrix = this._getComputedTransformVal();
		if(matrix==='none'){
			return { x: 0, y: 0 };
		}
		matrix = matrix.replace(/ /g,''); // trim whitespaces
		var res =  matrix.match(/^matrix\([0-9\-\.]+ *, *[0-9\-\.]+ *, *[0-9\-\.]+ *, *[0-9\-\.]+ *, *([0-9\-\.]+) *, *([0-9\-\.]+)\)$/);
			/*
				matrix(1,0,0,1,191,200)
							   ^^^ ^^^
								x   y
			*/
		return {
			x: Number(res[1]),
			y: Number(res[2])
		};
	},
	_getComputedTranslate3dVal: function(){
		var xy = this._getComputedTranslate3dXY();
		this._translateX = xy.x;
		this._translateY = xy.y;
		return [ 'translate3d(', xy.x, 'px,', xy.y, 'px,0)' ].join('');
	},
	getXY: function(){
		(this._translateX === null) && this._getComputedTranslate3dVal();
		return {
			x: this._translateX,
			y: this._translateY
		}
	},
	getComputedXY: function(){
		var xy = this._getComputedTranslate3dXY();
		return xy;
	}
});

/* static */
$.ui.transformAnimator.isAvailable = function(){
	return $.support.webkitTransition && $.support.webkitTransform;
};

	
})(jQuery); // end $=jQuery encapsulation
