(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', 'route-node'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('route-node'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global.RouteNode);
        global.Router5 = mod.exports;
    }
})(this, function (exports, module, _routeNode) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _RouteNode = _interopRequireDefault(_routeNode);

    var nameToIDs = function nameToIDs(name) {
        return name.split('.').reduce(function (ids, name) {
            ids.push(ids.length ? ids[ids.length - 1] + '.' + name : name);
            return ids;
        }, []);
    };

    var makeState = function makeState(name, params, path) {
        return { name: name, params: params, path: path };
    };

    /**
     * Create a new Router5 instance
     * @class
     * @param {RouteNode[]|Object[]|RouteNode|Object} routes The router routes
     * @param {Object} [opts={}] The router options: useHash, defaultRoute, defaultParams and prefix can be specified.
     * @return {Router5} The router instance
     */

    var Router5 = (function () {
        function Router5(routes) {
            var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, Router5);

            this.started = false;
            this.callbacks = {};
            this.lastStateAttempt = null;
            this.lastKnownState = null;
            this.rootNode = routes instanceof _RouteNode['default'] ? routes : new _RouteNode['default']('', '', routes);
            this.activeComponents = {};
            this.options = opts;
            this.base = window.location.pathname.replace(/^\/$/, '');

            this.fixupOptions();

            return this;
        }

        _createClass(Router5, [{
            key: 'setOption',

            /**
             * Set an option value
             * @param  {String} opt The option to set
             * @param  {*}      val The option value
             * @return {Router5}    The Router5 instance
             */
            value: function setOption(opt, val) {
                this.options[opt] = val;

                this.fixupOptions();

                return this;
            }
        }, {
            key: 'fixupOptions',

            /**
             * Fix options
             */
            value: function fixupOptions() {
                if (!this.options.prefix) {
                    this.options.prefix = '';
                }
            }
        }, {
            key: 'add',

            /**
             * Add route(s)
             * @param  {RouteNode[]|Object[]|RouteNode|Object} routes Route(s) to add
             * @return {Router5}  The Router5 instance
             */
            value: function add(routes) {
                this.rootNode.add(routes);
                return this;
            }
        }, {
            key: 'addNode',

            /**
             * Add a route to the router.
             * @param {String} name The route name
             * @param {String} path The route path
             * @return {Router5}  The Router5 instance
             */
            value: function addNode(name, path) {
                this.rootNode.addNode(name, path);
                return this;
            }
        }, {
            key: 'onPopState',

            /**
             * @private
             */
            value: function onPopState(evt) {
                // Do nothing if no state or if last know state is poped state (it should never happen)
                var state = evt.state || this.matchPath(this.getLocation());
                if (!state) return;
                if (this.lastKnownState && this.areStatesEqual(state, this.lastKnownState)) return;

                var canTransition = this._transition(state, this.lastKnownState);
                if (!canTransition) {
                    var url = this.buildUrl(this.lastKnownState.name, this.lastKnownState.params);
                    window.history.pushState(this.lastKnownState, '', url);
                }
            }
        }, {
            key: 'start',

            /**
             * Start the router
             * @return {Router5} The router instance
             */
            value: function start() {
                if (this.started) return this;
                this.started = true;

                // Try to match starting path name
                var startPath = this.getLocation();
                var startState = this.matchPath(startPath);

                if (startState) {
                    this.lastKnownState = startState;
                    window.history.replaceState(this.lastKnownState, '', this.buildUrl(startState.name, startState.params));
                } else if (this.options.defaultRoute) {
                    this.navigate(this.options.defaultRoute, this.options.defaultParams, { replace: true });
                }
                // Listen to popstate
                window.addEventListener('popstate', this.onPopState.bind(this));
                return this;
            }
        }, {
            key: 'stop',

            /**
             * Stop the router
             * @return {Router5} The router instance
             */
            value: function stop() {
                if (!this.started) return this;
                this.started = false;

                window.removeEventListener('popstate', this.onPopState.bind(this));
                return this;
            }
        }, {
            key: 'getState',

            /**
             * Return the current state object
             * @return {Object} The current state
             */
            value: function getState() {
                return this.lastKnownState
                // return window.history.state
                ;
            }
        }, {
            key: 'isActive',

            /**
             * Whether or not the given route name with specified params is active.
             * @param  {String}   name             The route name
             * @param  {Object}   [params={}]      The route parameters
             * @param  {Boolean}  [equality=false] If set to false (default), isActive will return true
             *                                     if the provided route name and params are descendants
             *                                     of the active state.
             * @return {Boolean}                   Whether nor not the route is active
             */
            value: function isActive(name) {
                var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                var strictEquality = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

                var activeState = this.getState();

                if (!activeState) return false;

                if (strictEquality || activeState.name === name) {
                    return this.areStatesEqual(makeState(name, params), activeState);
                } else {
                    return this.areStatesDescendants(makeState(name, params), activeState);
                }
            }
        }, {
            key: 'areStatesEqual',

            /**
             * @private
             */
            value: function areStatesEqual(state1, state2) {
                return state1.name === state2.name && Object.keys(state1.params).length === Object.keys(state2.params).length && Object.keys(state1.params).every(function (p) {
                    return state1.params[p] === state2.params[p];
                });
            }
        }, {
            key: 'areStatesDescendants',

            /**
             * Whether two states are descendants
             * @param  {Object} parentState The parent state
             * @param  {Object} childState  The child state
             * @return {Boolean}            Whether the two provided states are related
             */
            value: function areStatesDescendants(parentState, childState) {
                var regex = new RegExp('^' + parentState.name + '\\.(.*)$');
                if (!regex.test(childState.name)) return false;
                // If child state name extends parent state name, and all parent state params
                // are in child state params.
                return Object.keys(parentState.params).every(function (p) {
                    return parentState.params[p] === childState.params[p];
                });
            }
        }, {
            key: '_invokeListeners',

            /**
             * @private
             */
            value: function _invokeListeners(name, newState, oldState) {
                if (!this.callbacks[name]) return;
                this.callbacks[name].forEach(function (cb) {
                    return cb(newState, oldState);
                });
            }
        }, {
            key: '_addListener',

            /**
             * @private
             */
            value: function _addListener(name, cb) {
                var normalizedName = name.replace(/^(\*|\^|=)/, '');
                if (normalizedName) {
                    var segments = this.rootNode.getSegmentsByName(normalizedName);
                    if (!segments) console.warn('No route found for ' + normalizedName + ', listener might never be called!');
                }
                if (!this.callbacks[name]) this.callbacks[name] = [];
                this.callbacks[name].push(cb);
                return this;
            }
        }, {
            key: '_removeListener',

            /**
             * @private
             */
            value: function _removeListener(name, cb) {
                if (this.callbacks[name]) this.callbacks[name] = this.callbacks[name].filter(function (callback) {
                    return callback !== cb;
                });
                return this;
            }
        }, {
            key: 'addListener',

            /**
             * Add a route change listener
             * @param {Function} cb The listener to add
             * @return {Router5} The router instance
             */
            value: function addListener(cb) {
                return this._addListener('*', cb);
            }
        }, {
            key: 'removeListener',

            /**
             * Remove a route change listener
             * @param  {Function} cb The listener to remove
             * @return {Router5} The router instance
             */
            value: function removeListener(cb) {
                return this._removeListener('*', cb);
            }
        }, {
            key: 'addNodeListener',

            /**
             * Add a node change listener
             * @param {String}   name The route segment full name
             * @param {Function} cb   The listener to add
             * @return {Router5} The router instance
             */
            value: function addNodeListener(name, cb) {
                return this._addListener('^' + name, cb);
            }
        }, {
            key: 'removeNodeListener',

            /**
             * Remove a node change listener
             * @param {String}   name The route segment full name
             * @param {Function} cb   The listener to remove
             * @return {Router5} The router instance
             */
            value: function removeNodeListener(name, cb) {
                return this._removeListener('^' + name, cb);
            }
        }, {
            key: 'addRouteListener',

            /**
             * Add a route change listener
             * @param {String}   name The route name to listen to
             * @param {Function} cb   The listener to add
             * @return {Router5} The router instance
             */
            value: function addRouteListener(name, cb) {
                return this._addListener('=' + name, cb);
            }
        }, {
            key: 'removeRouteListener',

            /**
             * Remove a route change listener
             * @param {String}   name The route name to listen to
             * @param {Function} cb   The listener to remove
             * @return {Router5} The router instance
             */
            value: function removeRouteListener(name, cb) {
                return this._removeListener('=' + name, cb);
            }
        }, {
            key: 'registerComponent',

            /**
             * Register an active component for a specific route segment
             * @param  {String} name      The route segment full name
             * @param  {Object} component The component instance
             */
            value: function registerComponent(name, component) {
                if (this.activeComponents[name]) console.warn('A component was alread registered for route node ' + name + '.');
                this.activeComponents[name] = component;
                return this;
            }
        }, {
            key: 'deregisterComponent',

            /**
             * Deregister an active component
             * @param  {String} name The route segment full name
             * @return {Router5} The router instance
             */
            value: function deregisterComponent(name) {
                delete this.activeComponents[name];
            }
        }, {
            key: 'getLocation',

            /**
             * @private
             */
            value: function getLocation() {
                return this.options.useHash ? window.location.hash.replace(new RegExp('^#' + this.options.prefix), '') : window.location.pathname.replace(new RegExp('^' + this.base + this.options.prefix), '');
            }
        }, {
            key: 'buildUrl',

            /**
             * Generates an URL from a route name and route params.
             * The generated URL will be prefixed by hash if useHash is set to true
             * @param  {String} route  The route name
             * @param  {Object} params The route params (key-value pairs)
             * @return {String}        The built URL
             */
            value: function buildUrl(route, params) {
                return (this.options.useHash ? window.location.pathname + '#' : this.base) + this.options.prefix + this.rootNode.buildPath(route, params);
            }
        }, {
            key: 'buildPath',

            /**
             * Build a path from a route name and route params
             * The generated URL will be prefixed by hash if useHash is set to true
             * @param  {String} route  The route name
             * @param  {Object} params The route params (key-value pairs)
             * @return {String}        The built Path
             */
            value: function buildPath(route, params) {
                return this.rootNode.buildPath(route, params);
            }
        }, {
            key: 'matchPath',

            /**
             * Match a path against the route tree.
             * @param  {String} path   The path / URL to match
             * @return {Object}        The matched state object (null if no match)
             */
            value: function matchPath(path) {
                var match = this.rootNode.matchPath(path);
                return match ? makeState(match.name, match.params, path) : null;
            }
        }, {
            key: '_transition',

            /**
             * @private
             */
            value: function _transition(toState, fromState) {
                var _this = this;

                if (!fromState) {
                    this.lastKnownState = toState;
                    this._invokeListeners('*', toState, fromState);
                    return true;
                }

                var i = undefined;
                var cannotDeactivate = false;
                var fromStateIds = nameToIDs(fromState.name);
                var toStateIds = nameToIDs(toState.name);
                var maxI = Math.min(fromStateIds.length, toStateIds.length);

                for (i = 0; i < maxI; i += 1) {
                    if (fromStateIds[i] !== toStateIds[i]) break;
                }

                cannotDeactivate = fromStateIds.slice(i).reverse().map(function (id) {
                    return _this.activeComponents[id];
                }).filter(function (comp) {
                    return comp && comp.canDeactivate;
                }).some(function (comp) {
                    return !comp.canDeactivate(toState, fromState);
                });

                if (!cannotDeactivate) {
                    this.lastKnownState = toState;
                    this._invokeListeners('^' + (i > 0 ? fromStateIds[i - 1] : ''), toState, fromState);
                    this._invokeListeners('=' + toState.name, toState, fromState);
                    this._invokeListeners('*', toState, fromState);
                }

                return !cannotDeactivate;
            }
        }, {
            key: 'navigate',

            /**
             * Navigate to a specific route
             * @param  {String} name   The route name
             * @param  {Object} [params={}] The route params
             * @param  {Object} [opts={}]   The route options (replace, reload)
             * @return {Boolean}       Whether or not transition was allowed
             */
            value: function navigate(name) {
                var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

                if (!this.started) return;

                var path = this.buildPath(name, params);
                var url = this.buildUrl(name, params);

                if (!path) throw new Error('Could not find route "' + name + '"');

                this.lastStateAttempt = makeState(name, params, path);
                var sameStates = this.lastKnownState ? this.areStatesEqual(this.lastKnownState, this.lastStateAttempt) : false;

                // Do not proceed further if states are the same and no reload
                // (no desactivation and no callbacks)
                if (sameStates && !opts.reload) return;

                // Transition and amend history
                var canTransition = this._transition(this.lastStateAttempt, this.lastKnownState);

                if (canTransition && !sameStates) {
                    window.history[opts.replace ? 'replaceState' : 'pushState'](this.lastStateAttempt, '', url);
                }

                return canTransition;
            }
        }]);

        return Router5;
    })();

    module.exports = Router5;
});