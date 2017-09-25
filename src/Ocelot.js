class Pjax {
    constructor(el = 'ocelot-content') {
        // The element to watch
        this.el = el;

        // Page-specific events
        this.events = {};

        // Default changePage options
        this.defaultOpts = {endpoint: false, method: 'GET', timeout: 0, callback: null, callbackTimeout: 0, push: true};

        // Default pop callbacks
        this.prePopCallback = () => {
        };
        this.postPopCallback = null;

        // Register pop state events
        this.registerPop();
    }

    registerPop() {
        let self = this;

        if(history.pushState) {
            window.onpopstate = () => {
                let popOpts = {
                    endpoint : window.location.pathname,
                    push: false
                };

                // Change page without pushing new entry to the history
                if(self.prePopCallback) this.prePopCallback();
                if(self.postPopCallback) popOpts.callback = this.postPopCallback;
                self.changePage(popOpts);
            };
        } else {
            console.warn('Ocelot: this browser does not support history.pushState. Hash changing is coming soon.')
        }
    }

    setEvent(url, event) {
        this.events[url] = event;
    }

    changePage(customOpts = {}) {
        let opts = this.defaultOpts;

        Object.keys(customOpts).forEach((key) => {
            opts[key] = customOpts[key];
        });

        if(!opts.endpoint) console.warn('Ocelot: a PJAX endpoint is required.');

        // AJAX call made to endpoint
        let xhr = new XMLHttpRequest();
        xhr.open(opts.method, opts.endpoint, true);
        xhr.send();
        xhr.onreadystatechange = () => {
            if(xhr.readyState !== 4) return;
            if(xhr.status !== 200) {
                console.warn(`Ocelot: ${opts.method} ${opts.endpoint} returned ${xhr.status}.`);
                return;
            }

            // Set a timeout in case of any transition animations
            setTimeout(() => {
                // Get only AJAX-friendly content, we don't want to duplicate the CSS and JavaScript
                let temp = document.createElement('div');
                temp.innerHTML = xhr.responseText;
                document.querySelector(`#${this.el}`).innerHTML = temp.querySelector(`#${this.el}`).innerHTML;

                // Perform any page-specific events
                let pageEvent = this.events[opts.endpoint];
                if(pageEvent) {
                    if(typeof pageEvent !== 'function') {
                        console.warn(`Ocelot: ${opts.endpoint} event must be a function, instead found ${typeof pageEvent}.`);
                        return;
                    }
                    pageEvent();
                }
            }, opts.timeout);

            // Perform callback function (if any)
            setTimeout(function(){
                if(opts.callback === null) return;
                if(typeof opts.callback !== 'function') {
                    console.warn(`Ocelot: Callback must be a function, instead found ${typeof opts.callback}.`);
                    return;
                }

                opts.callback(xhr.responseText);
            }, opts.callbackTimeout);

            // Push to browser history to allow for back/forward
            if(opts.push) history.pushState('', 'New URL: ' + opts.endpoint, opts.endpoint);
        }
    }

    all(opts = {}) {
        document.addEventListener("click", (e) => {
            e = e || window.event;
            let target = e.target || e.srcElement;

            // Bubble up through the DOM to target links
            while(target) {
                if (target instanceof HTMLAnchorElement) {
                    opts.endpoint = target.attributes["href"].value;
                    opts.push = true;

                    let protocol = opts.endpoint.split(':')[0];
                    if(["mailto", "tel"].indexOf(protocol) !== -1) break;
                    if(isExternal(opts.endpoint)) break;

                    e.preventDefault();

                    if(typeof opts.prePopCallback !== "function") {
                        this.prePopCallback();
                    } else {
                        opts.prePopCallback();
                    }

                    this.changePage(opts);
                    break;
                }

                target = target.parentNode;
            }
        });
    }

    fadeAll(opts = {}) {
        if(!opts.timeout) opts.timeout = 250;
        if(!opts.callbackTimeout) opts.callbackTimeout = 250;
        if(!opts.fadeTo) opts.fadeTo = 0;
        if(!opts.prePopCallback) this.prePopCallback = () => { this.fadeContent(opts.fadeTo); };

        document.getElementById(this.el).style.transition = "opacity " + opts.timeout/1000 + "s ease-out";



        document.addEventListener("click", (e) => {
            e = e || window.event;
            let target = e.target || e.srcElement;

            // Bubble up through the DOM to target links
            while(target) {
                if (target instanceof HTMLAnchorElement) {
                    opts.endpoint = target.attributes["href"].value;
                    opts.push = true;

                    let protocol = opts.endpoint.split(':')[0];
                    if(["mailto", "tel"].indexOf(protocol) !== -1) break;
                    if(isExternal(opts.endpoint)) break;

                    e.preventDefault();

                    this.fadeContent(opts.fadeTo);

                    let passedCallback = opts.callback;
                    opts.callback = (data) => {
                        this.fadeContent(1);
                        if(passedCallback) passedCallback(data);
                    };

                    this.postPopCallback = opts.callback;

                    this.changePage(opts);
                    break;
                }

                target = target.parentNode;
            }
        });


    }

    fadeContent(fadeTo) {
        document.getElementById(this.el).style.opacity = fadeTo;
    };
}

export { Pjax };


const isExternal = (url) => {
    let match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if(typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if(typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
};