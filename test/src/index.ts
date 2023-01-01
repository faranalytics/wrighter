export { createRoute } from 'wrighter';
import * as http from 'node:http';
import { HTTP404Response, HTTP500Response, HTTPResponse } from './http_responses.js';
import { createRoute } from 'wrighter';
import {
    logger as log,
    RotatingFileHandler,
    ConsoleHandler,
    Formatter,
    IMeta,
    Level
} from 'memoir';

export class Context {

    [key: string]: any;

    toString() {
        try {
            return JSON.stringify(this);
        }
        catch (e) {
            return '[object Object]';
        }
    }
}

export type ReturnT = (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => Promise<boolean | null | undefined>;

export let logRequestTo = createRoute<
    [
        log: (message: string) => void,
        formatter?: (remoteAddress?: string, method?: string, url?: string) => string
    ], ReturnT>(
        function logRequestTo(
            log: (message: any) => void,
            formatter?: (remoteAddress?: string, method?: string, url?: string) => string
        ) {
            return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {
                let scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';
                let url = `${scheme}://${req.headers.host}${req.url}`;
                let remoteAddress = `${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;

                if (formatter) {
                    log(formatter(remoteAddress, req.method, url));
                }
                else {
                    log(`:${remoteAddress}:${req.method}:${url}`);
                }
                return true;
            }
        });

export let matchSchemePort = createRoute<[scheme: string, port: number], ReturnT>(function matchSchemePort(
    scheme: string,
    port: number
) {
    return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {

        if (req.url) {
            let _scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';
            let url = new URL(req.url, `${_scheme}://${req.headers.host}`);
            ctx.url = url;
            return scheme === _scheme && port === req.socket.localPort;
        }
        return false;
    }
});

export let matchHost = createRoute<[hostRegex: RegExp], ReturnT>(function matchHost(hostRegex: RegExp) {
    return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {

        if (req.url) {
            let url = new URL(req.url, `${ctx['scheme']}://${req.headers.host}`);
            ctx['url'] = url;
            return hostRegex.test(url.hostname);
        }
        return false;
    }
});

export let matchMethod = createRoute<[methodRegex: RegExp], ReturnT>(function matchMethod(methodRegex: RegExp) {
    return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {

        if (req.method) {
            return methodRegex.test(req.method);
        }
        return false;
    }
});

export let matchPath = createRoute<[pathRegex: RegExp], ReturnT>(function matchPath(pathRegex: RegExp) {
    return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {

        if (ctx?.url?.pathname) {
            return pathRegex.test(ctx.url.pathname);
        }
        return false;
    }
});

export let routeTo = createRoute<[
    (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => boolean | null | void],
    ReturnT>(function routeTo(fn) {
        return async (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => {

            let result = fn(req, res, ctx);

            if (typeof result == 'boolean') {
                return result;
            }
            else {
                return null;
            }
        }
    });

export let requestListener = createRoute <
    [
        router: (req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => Promise<boolean | null | void>,
        options: { errorLog: (error: string) => void }
    ],
(req: http.IncomingMessage, res: http.ServerResponse) => Promise < any >
> (function requestListener(router, options) {
        return async (req: http.IncomingMessage, res: http.ServerResponse) => {
            try {
                let result = await router(req, res, new Context());

                if (result === false) {
                    throw new HTTP404Response();
                }
                else if (result === true) {
                    return true;
                }
                else {
                    return null;
                }
            }
            catch (e: unknown) {

                if (e instanceof HTTPResponse) {

                    res.writeHead(e.code, {
                        'Content-Length': Buffer.byteLength(e.message),
                        'Content-Type': 'text/html'
                    });

                    res.end(e.message);
                }
                else {
                    let message = 'Internal Server Error';

                    res.writeHead(500, {
                        'Content-Length': Buffer.byteLength(message),
                        'Content-Type': 'text/html'
                    });

                    res.end(message);

                    if (e instanceof Error) {
                        options.errorLog(e.stack ? e.stack : e.message);
                    }
                }
            }
        }
    }
    );


let formatter = new Formatter<string, string>(
    (message: string, { level, func, url, line, col }: IMeta): string => {
        url = url?.replace(/^.*\/(.*)$/, '$1');
        return `${level}:${new Date().toISOString()}:${url}:${func}:${line}:${col}:${message}`;
    });
let consoleHandler = new ConsoleHandler<string, string>();
consoleHandler.setLevel(Level.DEBUG);
consoleHandler.setFormatter(formatter);
log.addHandler(consoleHandler);

let rotatingFileHandler = new RotatingFileHandler({
    path: '/home/adpatter/workspace/faranalytics/faranalytics.net/route.log'
});
rotatingFileHandler.setLevel(Level.DEBUG);
rotatingFileHandler.setFormatter(formatter);
log.addHandler(rotatingFileHandler);

function resource(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context
) {

    let body = 'TEST';

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });

    res.end(body);
}

let router = logRequestTo(log.debug)(

    matchSchemePort('http', 3000)(

        matchHost(/^farar\.net$/)(

            matchMethod(/GET/)(

                matchPath(/\/page/)(

                    routeTo(resource)
                ),
                matchPath(/\/api/)(

                    routeTo(resource)
                )
            )
        )
    )
);

export function createRequestListener(router: ReturnT) {
    return requestListener(router, {errorLog:log.error})();
}

http.createServer(createRequestListener(router)).listen({ port: 3000 });