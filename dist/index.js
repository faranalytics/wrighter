const _matcher = Symbol('matcher');
const _wrapper = Symbol('wrapper');
const _router = Symbol('router');
export function create(handler) {
    function matcher(...matches) {
        function wrapper(...routes) {
            async function router(...args) {
                let match = handler(...args, ...matches);
                if (match === true) {
                    for (let i = 0; i < routes.length; i++) {
                        if (routes[i].hasOwnProperty(_matcher)) {
                            routes[i] = routes[i]()();
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
    return Object.defineProperty(matcher, _matcher, {
        value: null,
        writable: false,
        configurable: false
    });
}
