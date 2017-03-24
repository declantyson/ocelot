'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pjax = function () {
    function Pjax() {
        var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ocelot-content';

        _classCallCheck(this, Pjax);

        // The element to watch
        this.el = el;

        // Page-specific events
        this.events = {};

        // Default changePage options
        this.defaultOpts = { endpoint: false, method: 'GET', timeout: 0, callback: null, callbackTimeout: 0, push: true };

        // Default pop callbacks
        this.prePopCallback = function () {};
        this.postPopCallback = null;

        // Register pop state events
        this.registerPop();
    }

    _createClass(Pjax, [{
        key: 'registerPop',
        value: function registerPop() {
            var _this = this;

            var self = this;

            if (history.pushState) {
                window.onpopstate = function () {
                    var popOpts = {
                        endpoint: window.location.pathname,
                        push: false
                    };

                    // Change page without pushing new entry to the history
                    if (self.prePopCallback) _this.prePopCallback();
                    if (self.postPopCallback) popOpts.callback = _this.postPopCallback;
                    self.changePage(popOpts);
                };
            } else {
                console.warn('Ocelot: this browser does not support history.pushState. Hash changing is coming soon.');
            }
        }
    }, {
        key: 'setEvent',
        value: function setEvent(url, event) {
            this.events[url] = event;
        }
    }, {
        key: 'changePage',
        value: function changePage() {
            var _this2 = this;

            var customOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var opts = this.defaultOpts;

            Object.keys(customOpts).forEach(function (key) {
                opts[key] = customOpts[key];
            });

            if (!opts.endpoint) console.warn('Ocelot: a PJAX endpoint is required.');

            // AJAX call made to endpoint
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.endpoint, true);
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) {
                    console.warn('Ocelot: ' + opts.method + ' ' + opts.endpoint + ' returned ' + xhr.status + '.');
                    return;
                }

                // Set a timeout in case of any transition animations
                setTimeout(function () {
                    // Get only AJAX-friendly content, we don't want to duplicate the CSS and JavaScript
                    var temp = document.createElement('div');
                    temp.innerHTML = xhr.responseText;
                    document.querySelector('#' + _this2.el).innerHTML = temp.querySelector('#' + _this2.el).innerHTML;

                    // Perform any page-specific events
                    var pageEvent = _this2.events[opts.endpoint];
                    if (pageEvent) {
                        if (typeof pageEvent !== 'function') {
                            console.warn('Ocelot: ' + opts.endpoint + ' event must be a function, instead found ' + (typeof pageEvent === 'undefined' ? 'undefined' : _typeof(pageEvent)) + '.');
                            return;
                        }
                        pageEvent();
                    }
                }, opts.timeout);

                // Perform callback function (if any)
                setTimeout(function () {
                    if (opts.callback === null) return;
                    if (typeof opts.callback !== 'function') {
                        console.warn('Ocelot: Callback must be a function, instead found ' + _typeof(opts.callback) + '.');
                        return;
                    }

                    opts.callback(xhr.responseText);
                }, opts.callbackTimeout);

                // Push to browser history to allow for back/forward
                if (opts.push) history.pushState('', 'New URL: ' + opts.endpoint, opts.endpoint);
            };
        }
    }, {
        key: 'all',
        value: function all() {
            var _this3 = this;

            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            document.addEventListener("click", function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;

                // Bubble up through the DOM to target links
                while (target) {
                    if (target instanceof HTMLAnchorElement) {
                        opts.endpoint = target.attributes["href"].value;
                        var protocol = opts.endpoint.split(':')[0];
                        if (["mailto", "tel"].indexOf(protocol) !== -1) break;

                        e.preventDefault();

                        if (typeof opts.prePopCallback !== "function") {
                            _this3.prePopCallback();
                        } else {
                            opts.prePopCallback();
                        }

                        _this3.changePage(opts);
                        break;
                    }

                    target = target.parentNode;
                }
            });
        }
    }, {
        key: 'fadeAll',
        value: function fadeAll() {
            var _this4 = this;

            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (!opts.timeout) opts.timeout = 250;
            if (!opts.callbackTimeout) opts.callbackTimeout = 250;
            if (!opts.fadeTo) opts.fadeTo = 0;
            if (!opts.prePopCallback) this.prePopCallback = function () {
                _this4.fadeContent(opts.fadeTo);
            };

            document.getElementById(this.el).style.transition = "opacity " + opts.timeout / 1000 + "s ease-out";

            document.addEventListener("click", function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;

                // Bubble up through the DOM to target links
                while (target) {
                    if (target instanceof HTMLAnchorElement) {
                        var _ret = function () {
                            opts.endpoint = target.attributes["href"].value;
                            var protocol = opts.endpoint.split(':')[0];
                            if (["mailto", "tel"].indexOf(protocol) !== -1) return 'break';

                            e.preventDefault();

                            _this4.fadeContent(opts.fadeTo);

                            var passedCallback = opts.callback;
                            opts.callback = function (data) {
                                _this4.fadeContent(1);
                                if (passedCallback) passedCallback(data);
                            };

                            _this4.postPopCallback = opts.callback;

                            _this4.changePage(opts);
                            return 'break';
                        }();

                        if (_ret === 'break') break;
                    }

                    target = target.parentNode;
                }
            });
        }
    }, {
        key: 'fadeContent',
        value: function fadeContent(fadeTo) {
            document.getElementById(this.el).style.opacity = fadeTo;
        }
    }]);

    return Pjax;
}();

exports.Pjax = Pjax;
//# sourceMappingURL=Ocelot.js.map
