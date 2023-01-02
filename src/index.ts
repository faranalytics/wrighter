import { logger } from 'memoir';
import { accept, deny } from './symbols.js';

export { logger } from 'memoir';
export { ACCEPT, DENY, accept, deny } from './symbols.js';

const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');

export function createRoute<ArgsT extends Array<any>, ReturnT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => ReturnT) {

    function route(...args: ArgsT) {

        let closure: ReturnT = fn(...args);

        function connect(...routes: Array<typeof router | typeof connect | typeof route | Array<typeof router | typeof connect | typeof route>>): ReturnT {

            async function router(...routeArgs: Array<any>): Promise<any> {

                if (typeof closure == 'function') {

                    logger.debug(`Calling: ${fn.name}(${[...routeArgs]})`);

                    let match = await closure(...routeArgs);

                    if (match === accept) {

                        let _routes = [...routes];

                        for (let i = 0; i < _routes.length; i++) {

                            if (Array.isArray(_routes[i])) {
                                _routes.splice(i, 1, ...(_routes[i] as Array<typeof router>));
                            }

                            if (_routes[i].hasOwnProperty(_connect)) {
                                _routes[i] = (_routes[i] as typeof connect)(...[] as typeof routes);
                            }

                            if (_routes[i].hasOwnProperty(_router)) {

                                let match = await (_routes[i] as typeof router)(...routeArgs);

                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a connect, or router.  Encountered a ${_routes[i].toString()} instead.`)
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
