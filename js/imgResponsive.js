/*! imgResponsive.js v 0.2 | Author: Jarrod Smith, 2013 */
(function($) {	
	$(function() {
		$.fn.imgResponsive = function(options) {
			var defaults = {
				breakpoints:[]
			};
			var elems = this;
			var settings = $.extend(defaults, options);
			var isRetina = window.devicePixelRatio >= 1.4;
		    var jRes = jRespond(settings.breakpoints);
			
			// if no breakpoints, just check for retina or not
			if (settings.breakpoints.length > 0) {
				for (var x = 0; x < settings.breakpoints.length; x++) {
					var newObj = {
						breakpoint: settings.breakpoints[x].label,
						enter: function() {
							elems.each(function() {
								setImageSrc($(this), jRes.getBreakpoint());
							});								
						}
					};
					jRes.addFunc(newObj);
				}
			}
			else {
				setImageSrc($(this));
			}
			
			function setImageSrc(el, size) {
				try {
					$(el).each(function() {
						if ($(this).data('image') !== undefined) {
							var initialUrl = $(this).data('image');
							var doctoredUrl = initialUrl.split('?');
							var imageNameParts = doctoredUrl[0].split('.');
							var path = '';
							
							// if no breakpoint size, default to image name / image name @2
							//isRetina = true; // test retina on non-retina device
							if (isRetina) {
								if (size == null) {
									path = imageNameParts[0] + '@2x.' + imageNameParts[1];
								}
								else {
									path = imageNameParts[0] + '-' + size +  '@2x.' + imageNameParts[1];
								}
							}
							else {
								if (size == null) {
									path = imageNameParts[0] + '.' + imageNameParts[1];
								}
								else {
									path = imageNameParts[0] + '-' + size +  '.' + imageNameParts[1];
								}
							}
							// only update image src if file exists
							if (UrlExists(path))
							{
								$(this).attr('src', path);
							}
							else
							{
								$(this).attr('src', $(this).data('image'));
							}
						}
					});
				}
				catch (ex) {
					//console.log(ex);
				}
			}
		};
	});
	
	function UrlExists(url)
	{
		var http = new XMLHttpRequest();
		http.open('HEAD', url, false);
		http.send();
		return http.status!=404;
	}
})(jQuery);


/*! jRespond.js v 0.9 | Author: Jeremy Fields [jeremy.fields@viget.com], 2013 | License: MIT */
(function(win,doc,undefined) {

	'use strict';

	win.jRespond = function(breakpoints) {

		// array for registered functions
		var mediaListeners = [];

		// array that corresponds to mediaListeners and holds the current on/off state
		var mediaInit = [];

		// array of media query breakpoints; adjust as needed
		var mediaBreakpoints = breakpoints;

		// store the current breakpoint
		var curr = '';

		// window resize event timer stuff
		var resizeTimer;
		var resizeW = 0;
		var resizeTmrFast = 100;
		var resizeTmrSlow = 500;
		var resizeTmrSpd = resizeTmrSlow;

		// cross browser window width
		var winWidth = function() {

			var w = 0;

			// IE
			if (!window.innerWidth) {

				if (!(document.documentElement.clientWidth === 0)) {

					// strict mode
					w = document.documentElement.clientWidth;
				} else {

					// quirks mode
					w = document.body.clientWidth;
				}
			} else {

				// w3c
				w = window.innerWidth;
			}

			return w;
		};

		// send media to the mediaListeners array
		var addFunction = function(elm) {

			var brkpt = elm['breakpoint'];
			var entr = elm['enter'] || undefined;

			// add function to stack
			mediaListeners.push(elm);

			// add corresponding entry to mediaInit
			mediaInit.push(false);

			if (testForCurr(brkpt)) {
				if (entr !== undefined) {
					entr.call();
				}
				mediaInit[(mediaListeners.length - 1)] = true;
			}
		};

		// loops through all registered functions and determines what should be fired
		var cycleThrough = function() {

			var enterArray = [];
			var exitArray = [];

			for (var i = 0; i < mediaListeners.length; i++) {
				var brkpt = mediaListeners[i]['breakpoint'];
				var entr = mediaListeners[i]['enter'] || undefined;
				var exit = mediaListeners[i]['exit'] || undefined;

				if (brkpt === '*') {
					if (entr !== undefined) {
						enterArray.push(entr);
					}
					if (exit !== undefined) {
						exitArray.push(exit);
					}
				} else if (testForCurr(brkpt)) {
					if (entr !== undefined && !mediaInit[i]) {
						enterArray.push(entr);
					}
					mediaInit[i] = true;
				} else {
					if (exit !== undefined && mediaInit[i]) {
						exitArray.push(exit);
					}
					mediaInit[i] = false;
				}
			}

			// loop through exit functions to call
			for (var j = 0; j < exitArray.length; j++) {
				exitArray[j].call();
			}

			// then loop through enter functions to call
			for (var k = 0; k < enterArray.length; k++) {
				enterArray[k].call();
			}
		};

		// checks for the correct breakpoint against the mediaBreakpoints list
		var returnBreakpoint = function(width) {

			var foundBrkpt = false;

			// look for existing breakpoint based on width
			for (var i = 0; i < mediaBreakpoints.length; i++) {

				// if registered breakpoint found, break out of loop
				if (width >= mediaBreakpoints[i]['enter'] && width <= mediaBreakpoints[i]['exit']) {
					foundBrkpt = true;

					break;
				}
			}

			// if breakpoint is found and it's not the current one
			if (foundBrkpt && curr !== mediaBreakpoints[i]['label']) {
				curr = mediaBreakpoints[i]['label'];

				// run the loop
				cycleThrough();

			// or if no breakpoint applies
			} else if (!foundBrkpt && curr !== '') {
				curr = '';

				// run the loop
				cycleThrough();
			}

		};

		// takes the breakpoint/s arguement from an object and tests it against the current state
		var testForCurr = function(elm) {

			// if there's an array of breakpoints
			if (typeof elm === 'object') {
				if (elm.join().indexOf(curr) >= 0) {
					return true;
				}

			// if the string is '*' then run at every breakpoint
			} else if (elm === '*') {
				return true;

			// or if it's a single breakpoint
			} else if (typeof elm === 'string') {
				if (curr === elm) {
					return true;
				}
			}
		};

		// self-calling function that checks the browser width and delegates if it detects a change
		var checkResize = function() {

			// get current width
			var w = winWidth();

			// if there is a change speed up the timer and fire the returnBreakpoint function
			if (w !== resizeW) {
				//resizeTmrSpd = resizeTmrFast;
				resizeTmrSpd = resizeTmrSlow;
				
				returnBreakpoint(w);

			// otherwise keep on keepin' on
			} else {
				resizeTmrSpd = resizeTmrSlow;
			}

			resizeW = w;

			// calls itself on a setTimeout
			setTimeout(checkResize, resizeTmrSpd);
		};
		checkResize();

		// return
		return {
			addFunc: function(elm) { addFunction(elm); },
			getBreakpoint: function() { return curr; }
		};

	};

}(this,this.document));