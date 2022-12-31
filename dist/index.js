import { logger } from 'memoir';
const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');
export function createRoute(handler) {
    function route(...routeArgs) {
        function connect(..._routes) {
            async function router(...args) {
                logger.debug(`Calling: ${handler.name}(${[...args, ...routeArgs]})`);
                let match = handler(...[...args, ...routeArgs]);
                let routes = [..._routes];
                if (match === true) {
                    for (let i = 0; i < routes.length; i++) {
                        if (Array.isArray(routes[i])) {
                            routes.splice(i, 1, ...routes[i]);
                        }
                        if (routes[i].hasOwnProperty(_route)) {
                            routes[i] = routes[i](...routeArgs)();
                        }
                        else if (routes[i].hasOwnProperty(_connect)) {
                            routes[i] = routes[i]();
                        }
                        if (routes[i].hasOwnProperty(_router)) {
                            let match = await routes[i](...args);
                            if (match === true) {
                                return true;
                            }
                            else if (typeof match == 'undefined' || match == null) {
                                return null;
                            }
                            else if (match !== false) {
                                throw new Error(`A route handler must return true, undefined, or false; A ${match} was encountered instead.`);
                            }
                        }
                        else {
                            throw new Error(`Expected a route, connect, or router.  Encountered a ${routes[i].name ? routes[i].name : routes[i].toString()} instead.`);
                        }
                    }
                    return false;
                }
                else if (match === null || typeof match === 'undefined') {
                    return null;
                }
                return false;
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
