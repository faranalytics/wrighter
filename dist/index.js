import { logger } from 'memoir';
import { accept, deny } from './symbols.js';
export { ACCEPT, DENY, accept, deny } from './symbols.js';
const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');
export function createRoute(fn) {
    function route(...args) {
        let closure = fn(...args);
        function connect(..._routes) {
            async function router(...routeArgs) {
                if (typeof closure == 'function') {
                    logger.debug(`Calling: ${closure.name}(${[...routeArgs]})`);
                    let match = await closure(...routeArgs);
                    if (match === accept) {
                        let routes = [..._routes];
                        for (let i = 0; i < routes.length; i++) {
                            if (Array.isArray(routes[i])) {
                                routes.splice(i, 1, ...routes[i]);
                            }
                            if (routes[i].hasOwnProperty(_connect)) {
                                routes[i] = routes[i](...[]);
                            }
                            if (routes[i].hasOwnProperty(_router)) {
                                let match = await routes[i](...routeArgs);
                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a connect, or router.  Encountered a ${routes[i].toString()} instead.`);
                            }
                        }
                        return deny;
                    }
                    else if (match !== deny) {
                        return match;
                    }
                    return deny;
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
