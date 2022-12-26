const _route = Symbol('matcher');
const _wrapper = Symbol('wrapper');
const _router = Symbol('router');
export function createRoute(handler) {
    function route(...routeArgs) {
        function wrapper(..._routes) {
            async function router(...args) {
                let match = false;
                let handlerArgs = [...args, ...routeArgs];
                match = handler(...handlerArgs);
                let routes = [..._routes];
                if (match === true) {
                    for (let i = 0; i < routes.length; i++) {
                        if (Array.isArray(routes[i])) {
                            routes.splice(i, 1, ...routes[i]);
                        }
                        if (routes[i].hasOwnProperty(_route)) {
                            // routes[i] = (routes[i] as typeof route)()();
                        }
                        else if (routes[i].hasOwnProperty(_wrapper)) {
                            routes[i] = routes[i]();
                        }
                        if (routes[i].hasOwnProperty(_router)) {
                            let match = await routes[i](...args);
                            if (match === true) {
                                return match;
                            }
                            else if (typeof match == 'undefined') {
                                return null;
                            }
                        }
                        else {
                            throw new Error(`Expected a matcher, wrapper, or router.  Encountered a ${routes[i].name ? routes[i].name : routes[i].toString()} instead.`);
                        }
                    }
                }
                return match;
            }
            return Object.defineProperty(router, _router, {
                value: null,
                writable: false,
                configurable: false
            });
        }
        return Object.defineProperty(wrapper, _wrapper, {
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
