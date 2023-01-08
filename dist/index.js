import { logger } from 'memoir';
import { accept, deny } from './symbols.js';
export { logger } from 'memoir';
export { accept, deny } from './symbols.js';
const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');
export function createHandler(fn) {
    function route(...args) {
        let matcher = fn(...args);
        async function router(...routeArgs) {
            if (typeof matcher == 'function') {
                logger.debug(`Calling: ${fn.name}(${[...routeArgs]})`);
                let match = await matcher(...routeArgs);
                return match;
            }
        }
        return Object.defineProperty(router, _router, {
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
                    logger.debug(`Calling: ${fn.name}(${[...routeArgs]})`);
                    let match = await matcher(...routeArgs);
                    if (match === accept && routes.length > 0) {
                        let _routes = [...routes];
                        for (let i = 0; i < _routes.length; i++) {
                            if (Array.isArray(_routes[i])) {
                                _routes.splice(i, 1, ..._routes[i]);
                            }
                            if (_routes[i].hasOwnProperty(_router)) {
                                let match = await _routes[i](...routeArgs);
                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a connect, or router.  Encountered a ${_routes[i].toString()} instead.`);
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
