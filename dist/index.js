import { Level, logger } from 'memoir';
import { accept, deny } from './symbols.js';
export { logger } from 'memoir';
export { accept, deny } from './symbols.js';
const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');
const _handler = Symbol('handler');
function replacer(k, v) {
    if (v instanceof RegExp) {
        return v.toString();
    }
    else if (typeof v == 'function') {
        return v.name;
    }
    return v;
}
export function createHandler(fn) {
    function route(...args) {
        let matcher = fn(...args);
        async function handler(...routeArgs) {
            if (typeof matcher == 'function') {
                if (logger.level == Level.DEBUG) {
                    logger.debug(`Calling: ${fn.name}(${JSON.stringify([...args], replacer).replace(/(?:^\[|\]$)/g, '')})`);
                }
                let match = await matcher(...routeArgs);
                return match;
            }
        }
        return Object.defineProperty(handler, _handler, {
            value: null,
            writable: false,
            configurable: false
        });
    }
    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}
export function createRoute(fn) {
    function route(...args) {
        let matcher = fn(...args);
        function connect(...routes) {
            async function router(...routeArgs) {
                if (typeof matcher == 'function') {
                    if (logger.level == Level.DEBUG) {
                        logger.debug(`Calling: ${fn.name}(${JSON.stringify([...args], replacer).replace(/(?:^\[|\]$)/g, '')})`);
                    }
                    let match = await matcher(...routeArgs);
                    if (match === accept && routes.length > 0) {
                        let _routes = [...routes];
                        for (let i = 0; i < _routes.length; i++) {
                            if (Array.isArray(_routes[i])) {
                                _routes.splice(i, 1, ..._routes[i]);
                            }
                            if (_routes[i].hasOwnProperty(_router) || _routes[i].hasOwnProperty(_handler)) {
                                let match = await _routes[i](...routeArgs);
                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a router or handler.  Encountered a ${_routes[i].toString()} instead.`);
                            }
                        }
                        return deny;
                    }
                    return match;
                }
            }
            return Object.defineProperty(router, _router, {
                value: null,
                writable: false,
                configurable: false
            });
        }
        return Object.defineProperty(connect, _connect, {
            value: null,
            writable: false,
            configurable: false
        });
    }
    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}
export function createTransformer(fn) {
    function route(...args) {
        let connector = fn(...args);
        function connect(...routes) {
            async function router(...routeArgs) {
                if (typeof connector == 'function') {
                    if (logger.level == Level.DEBUG) {
                        logger.debug(`Calling: ${fn.name}(${JSON.stringify([...args], replacer).replace(/(?:^\[|\]$)/g, '')})`);
                    }
                    async function forward(...routeArgs) {
                        if (routes.length > 0) {
                            let _routes = [...routes];
                            for (let i = 0; i < _routes.length; i++) {
                                if (Array.isArray(_routes[i])) {
                                    _routes.splice(i, 1, ..._routes[i]);
                                }
                                if (_routes[i].hasOwnProperty(_router) || _routes[i].hasOwnProperty(_handler)) {
                                    let match = await _routes[i](...routeArgs);
                                    if (match !== deny) {
                                        return match;
                                    }
                                }
                                else {
                                    throw new Error(`Expected a router or handler.  Encountered a ${_routes[i].toString()} instead.`);
                                }
                            }
                            return deny;
                        }
                        return deny;
                    }
                    return await connector(forward, ...routeArgs);
                }
            }
            return Object.defineProperty(router, _router, {
                value: null,
                writable: false,
                configurable: false
            });
        }
        return Object.defineProperty(connect, _connect, {
            value: null,
            writable: false,
            configurable: false
        });
    }
    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}
