// Browser Compatibility Polyfills
(function() {
    'use strict';

    // Polyfill for older browsers
    
    // Array.includes polyfill (IE support)
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        };
    }

    // Object.assign polyfill (IE support)
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            const to = Object(target);
            for (let index = 1; index < arguments.length; index++) {
                const nextSource = arguments[index];
                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Fetch polyfill for older browsers
    if (!window.fetch) {
        window.fetch = function(url, options) {
            return new Promise(function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        text: function() { return Promise.resolve(xhr.responseText); },
                        json: function() { return Promise.resolve(JSON.parse(xhr.responseText)); }
                    });
                };
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                xhr.open(options && options.method || 'GET', url);
                if (options && options.headers) {
                    for (const header in options.headers) {
                        xhr.setRequestHeader(header, options.headers[header]);
                    }
                }
                xhr.send(options && options.body || null);
            });
        };
    }

    // Promise polyfill for very old browsers
    if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
            const self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];

            function resolve(value) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = value;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }

            function reject(reason) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = reason;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }

            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }

            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(value) {
                            try {
                                resolve(onFulfilled ? onFulfilled(value) : value);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(reason) {
                            try {
                                resolve(onRejected ? onRejected(reason) : reason);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };

            executor(resolve, reject);
        };
    }

    // CSS.supports polyfill
    if (!window.CSS || !CSS.supports) {
        window.CSS = window.CSS || {};
        CSS.supports = function(property, value) {
            const element = document.createElement('div');
            try {
                element.style[property] = value;
                return element.style[property] === value;
            } catch (e) {
                return false;
            }
        };
    }

    // CustomEvent polyfill for IE
    if (typeof CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    // Browser-specific fixes
    const userAgent = navigator.userAgent;

    // Safari-specific fixes
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        // Fix for Safari's date parsing
        const originalDate = Date;
        Date = function(dateString) {
            if (typeof dateString === 'string' && dateString.includes('-')) {
                dateString = dateString.replace(/-/g, '/');
            }
            return new originalDate(dateString);
        };
        Date.prototype = originalDate.prototype;
    }

    // Firefox-specific fixes
    if (userAgent.includes('Firefox')) {
        // Add any Firefox-specific polyfills here
    }

    // Edge-specific fixes
    if (userAgent.includes('Edg')) {
        // Add any Edge-specific polyfills here
    }

    // Mobile browser fixes
    if (/Mobi|Android/i.test(userAgent)) {
        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Fix for iOS viewport height
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
    }

    console.log('✅ Browser polyfills loaded');
})();
