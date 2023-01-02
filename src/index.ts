import { logger } from 'memoir';
import { ACCEPT, DENY, accept, deny } from './symbols.js';

export { logger } from 'memoir';
export { ACCEPT, DENY, accept, deny } from './symbols.js';

const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');

export function createRoute<ArgsT extends Array<any>, ReturnT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => ReturnT) {

    function route(...args: ArgsT) {

        let closure: ReturnT = fn(...args);

        function connect(..._routes: Array<typeof router | typeof connect | typeof route | Array<typeof router | typeof connect | typeof route>>): ReturnT {

            async function router(...routeArgs: Array<any>): Promise<any> {

                if (typeof closure == 'function') {

                    logger.debug(`Calling: ${fn.name}(${[...routeArgs]})`);

                    let match = await closure(...routeArgs);

                    if (match === accept) {

                        let routes = [..._routes];

                        for (let i = 0; i < routes.length; i++) {

                            if (Array.isArray(routes[i])) {
                                routes.splice(i, 1, ...(routes[i] as Array<typeof router>));
                            }

                            if (routes[i].hasOwnProperty(_connect)) {
                                routes[i] = (routes[i] as typeof connect)(...[] as typeof _routes);
                            }

                            if (routes[i].hasOwnProperty(_router)) {

                                let match = await (routes[i] as typeof router)(...routeArgs);

                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a connect, or router.  Encountered a ${routes[i].toString()} instead.`)
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
            }) as ReturnT;
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
