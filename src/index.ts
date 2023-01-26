import { Level, logger } from 'memoir';
import { accept, deny } from './symbols.js';

export { logger } from 'memoir';
export { accept, deny } from './symbols.js';

const _route = Symbol('route');
const _connect = Symbol('connect');
const _router = Symbol('router');
const _handler = Symbol('handler');

function replacer(k: string, v: any) {
    if (v instanceof RegExp) {
        return v.toString();
    }
    else if (typeof v == 'function') {
        return v.name;
    }
    return v;
}

export function createHandler<ArgsT extends Array<any>, HandlerT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => HandlerT) {

    function route(...args: ArgsT): HandlerT {

        let matcher: HandlerT = fn(...args);

        async function handler(...routeArgs: Array<any>): Promise<any> {

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
        }) as HandlerT;
    }

    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}


export function createRoute<ArgsT extends Array<any>, RouterT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => RouterT) {

    function route(...args: ArgsT): typeof connect {

        let matcher: RouterT = fn(...args);

        function connect(...routes: Array<RouterT | Array<RouterT>>): RouterT {

            async function router(...routeArgs: Array<any>): Promise<any> {

                if (typeof matcher == 'function') {

                    if (logger.level == Level.DEBUG) {
                        logger.debug(`Calling: ${fn.name}(${JSON.stringify([...args], replacer).replace(/(?:^\[|\]$)/g, '')})`);
                    }

                    let match = await matcher(...routeArgs);

                    if (match === accept && routes.length > 0) {

                        let _routes = [...routes];

                        for (let i = 0; i < _routes.length; i++) {

                            if (Array.isArray(_routes[i])) {
                                _routes.splice(i, 1, ...(_routes[i] as Array<RouterT>));
                            }

                            if (_routes[i].hasOwnProperty(_router) || _routes[i].hasOwnProperty(_handler)) {

                                let match = await (_routes[i] as typeof router)(...routeArgs);

                                if (match !== deny) {
                                    return match;
                                }
                            }
                            else {
                                throw new Error(`Expected a router or handler.  Encountered a ${_routes[i].toString()} instead.`)
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
            }) as RouterT;
        }

        return Object.defineProperty(connect, _connect, {
            value: null,
            writable: false,
            configurable: false
        }) as typeof connect;
    }

    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}


export function createTransformer<
ArgsT extends Array<any>, 
RouterT extends (...args: Array<any>) => Promise<any>, 
TransformT extends (...args: Array<any>) => Promise<any>
>(fn: (...args: ArgsT) => (forward: TransformT, ...args:any)=>Promise<any>) {

    function route(...args: ArgsT): typeof connect {

        let connector: (forward: TransformT, ...args:any)=>Promise<any>  = fn(...args);

        function connect(...routes: Array<TransformT | Array<TransformT>>): RouterT {

            async function router(...routeArgs: Array<any>): Promise<any> {

                if (typeof connector == 'function') {

                    if (logger.level == Level.DEBUG) {
                        logger.debug(`Calling: ${fn.name}(${JSON.stringify([...args], replacer).replace(/(?:^\[|\]$)/g, '')})`);
                    }

                    async function forward(...routeArgs: Array<any>): Promise<any> {

                        if (routes.length > 0) {

                            let _routes = [...routes];

                            for (let i = 0; i < _routes.length; i++) {

                                if (Array.isArray(_routes[i])) {
                                    _routes.splice(i, 1, ...(_routes[i] as Array<TransformT>));
                                }

                                if (_routes[i].hasOwnProperty(_router) || _routes[i].hasOwnProperty(_handler)) {

                                    let match = await (_routes[i] as typeof router)(...routeArgs);

                                    if (match !== deny) {
                                        return match;
                                    }
                                }
                                else {
                                    throw new Error(`Expected a router or handler.  Encountered a ${_routes[i].toString()} instead.`)
                                }
                            }

                            return deny;
                        }

                        return deny;
                    }

                    return await connector(forward as TransformT, ...routeArgs);
                }
            }

            return Object.defineProperty(router, _router, {
                value: null,
                writable: false,
                configurable: false
            }) as RouterT;
        }

        return Object.defineProperty(connect, _connect, {
            value: null,
            writable: false,
            configurable: false
        }) as typeof connect;
    }

    return Object.defineProperty(route, _route, {
        value: null,
        writable: false,
        configurable: false
    });
}
