/*
*
*	pjaxit.js
*	Declan Tyson
*	v0.2
*	12/01/2017
*
*/

pjaxit = {
	dynamicElementId : "variable-content-container",
	changePage : function(endpoint, timeout, callback, callbacktimeout, push) {
		var timeout = typeof timeout !== 'undefined' ?  timeout : 0; // Delays the html assignment to the page (not the AJAX call itself). Can be set to allow for any transition animations (e.g. fade in loading spinner).
		var callback = typeof callback !== 'undefined' ?  callback : null; // Any callback you want to make (e.g. fade out loading spinner) after the html has been applied.
		var callbacktimeout = typeof callbacktimeout !== 'undefined' ?  callbacktimeout : 0; // How long you want to wait after the AJAX has returned before firing the callback.
		var push = typeof push !== 'undefined' ?  push : true; // Whether or not this should be pushed to the browser history.

		// AJAX call made to endpoint
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.open("GET", endpoint, true);
		ajaxRequest.send();
		ajaxRequest.onreadystatechange = function() {
			// Set a timeout in case of any transition animations
			if (ajaxRequest.readyState==4 && ajaxRequest.status==200) {
				setTimeout(function(){
					// Get only AJAX-friendly content, we don't want to duplicate the CSS and JavaScript
					var d = document.createElement('div');
					d.innerHTML = ajaxRequest.responseText;
					document.getElementById(pjaxit.dynamicElementId).innerHTML = d.querySelector("#" + pjaxit.dynamicElementId).innerHTML;
					// Perform any predefined page-specific javascript
					if(typeof pjaxit.pageChangeEvent[window.location.pathname] !== 'undefined') {
						pjaxit.pageChangeEvent[window.location.pathname]();
					}
				}, timeout);
				
				// Perform callback function (if any)
				setTimeout(function(){
					if(callback != null) callback(ajaxRequest.responseText);
				}, callbacktimeout);
				// Push to browser history to allow for back/forward (unless triggered by popstate event)
				if(push) history.pushState('', 'New URL: ' + endpoint, endpoint);
			}
		};
	},
	pageChangeEvent : {}
};

if(history.pushState) {
	window.onpopstate = function(event) {
		// Browser forward/back event
		pjaxit.changePage(window.location.pathname, 0, null, 0, false);
	};
}