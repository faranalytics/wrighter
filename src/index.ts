import { logger } from 'memoir';

const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');

export function createRoute<S extends Array<any>, T extends Array<any>,>(handler: (...args: [...S, ...T]) => boolean | void | null) {

    function route(...routeArgs: T): typeof connect {

        function connect(..._routes: Array<typeof route | typeof connect | typeof router | Array<typeof route | typeof connect | typeof router>>): typeof router {

            async function router(...args: S): Promise<boolean | void | null> {

                logger.debug(`Calling: ${handler.name}(${[...args, ...routeArgs]})`);

                let match = handler(...[...args, ...routeArgs]);

                let routes = [..._routes];

                if (match === true || match === null || typeof match === 'undefined') {

                    for (let i = 0; i < routes.length; i++) {

                        if (Array.isArray(routes[i])) {
                            routes.splice(i, 1, ...(routes[i] as Array<typeof route | typeof connect | typeof router>));
                        }

                        if (routes[i].hasOwnProperty(_route)) {
                            routes[i] = (routes[i] as typeof route)(...routeArgs)();
                        }
                        else if (routes[i].hasOwnProperty(_connect)) {
                            routes[i] = (routes[i] as typeof connect)();
                        }

                        if (routes[i].hasOwnProperty(_router)) {
                            let match = await (routes[i] as typeof router)(...args);

                            if (match === true) {
                                return match;
                            }
                            else if (typeof match == 'undefined' || match == null) {
                                return null;
                            }
                            else if (match !== false) {
                                throw new Error(`A route handler must return true, undefined, or false; A ${match} was encountered instead.`)
                            }
                        }
                        else {
                            throw new Error(`Expected a route, connect, or router.  Encountered a ${(routes[i] as typeof route | typeof connect | typeof router).name ? (routes[i] as typeof route | typeof connect | typeof router).name : routes[i].toString()} instead.`)
                        }
                    }

                    return false;
                }

                return match;
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