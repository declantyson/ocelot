class Pjax {
    constructor(el = 'ocelot-content') {
        // The element to watch
        this.el = el;

        // Page-specific events
        this.events = {};

        // Default changePage options
        this.defaultOpts = { endpoint : false, method : 'GET', timeout : 0, callback : null, callbackTimeout : 0, push : true };

        let self = this;
        if(history.pushState) {
            window.onpopstate = function() {
                // Change page without pushing new entry to the history
                self.changePage({
                    endpoint : window.location.pathname,
                    push: false
                });
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
                    e.preventDefault();

                    opts.endpoint = target.attributes["href"].value;
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

        document.getElementById(this.el).style.transition = "opacity " + opts.timeout/1000 + "s ease-out";

        document.addEventListener("click", (e) => {
            e = e || window.event;
            let target = e.target || e.srcElement;

            // Bubble up through the DOM to target links
            while(target) {
                if (target instanceof HTMLAnchorElement) {
                    e.preventDefault();

                    document.getElementById(this.el).style.opacity = opts.fadeTo;

                    let passedCallback = opts.callback;
                    opts.callback = (data) => {
                        document.getElementById(this.el).style.opacity = 1;
                        passedCallback(data);
                    };

                    opts.endpoint = target.attributes["href"].value;
                    this.changePage(opts);
                    break;
                }

                target = target.parentNode;
            }
        });
    }
}

export { Pjax };