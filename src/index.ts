const _matcher = Symbol('matcher');
const _wrapper = Symbol('wrapper');
const _router = Symbol('router');

export function create(handler: (...args: Array<any>) => boolean) {

    function matcher(...matches: Array<any>): typeof wrapper {

        function wrapper(...routes: Array<typeof matcher | typeof wrapper | typeof router>): typeof router {

            async function router(...args: Array<any>): Promise<boolean | null> {

                let match = handler(...args, ...matches);

                if (match === true) {
                    for (let i = 0; i < routes.length; i++) {

                        if (routes[i].hasOwnProperty(_matcher)) {
                            routes[i] = (routes[i] as typeof matcher)()();
                        }
                        else if (routes[i].hasOwnProperty(_wrapper)) {
                            routes[i] = (routes[i] as typeof wrapper)();
                        }

                        if (routes[i].hasOwnProperty(_router)) {
                            let match = await (routes[i] as typeof router)(...args);

                            if (match === true) {
                                return match;
                            }
                            else if (typeof match == 'undefined') {
                                return null;
                            }
                        }
                        else {
                            throw new Error(`Expected a matcher, wrapper, or router.  Encountered a ${routes[i].name ? routes[i].name : routes[i].toString()} instead.`)
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