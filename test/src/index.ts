import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';
import { HTTP404Response, HTTP500Response, HTTPResponse } from './http_responses.js';
import { createRoute } from 'wrighter';
import { logger as log, Level, Formatter, ConsoleHandler, IMeta } from 'memoir';

export class Context {

    [key: string]: any;

    toString() {
        try {
            return JSON.stringify(this);
        }
        catch (e) {
            return Object.toString();
        }
    }
}

type T = [
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context
]

function httpAdapter(router: (...args: T) => Promise<boolean | void | null>) {

    return async function (req: http.IncomingMessage, res: http.ServerResponse) {

        try {
            let result = await router(req, res, new Context());

            if (result === false) {
                throw new HTTP404Response();
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
                    log.debug(e.stack ? e.stack : e.message);
                }
            }
        }
    }
}

let logRequest = createRoute<T, [log: (message: string) => void]>(function logRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context,
    log: (message: any) => void
) {
    let scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';
    log(`${scheme}://${req.headers.host}${req.url}`);
    return true;
});

let matchSchemePort = createRoute<T, [scheme: string, port: number]>(function matchSchemePort(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context,
    scheme: string,
    port: number
) {
    if (req.url) {
        let _scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';
        let url = new URL(req.url, `${_scheme}://${req.headers.host}`);
        ctx.url = url;
        return scheme === _scheme && port === req.socket.localPort;
    }
    return false;
});

let matchHost = createRoute<T, [hostRegex: RegExp]>(function matchHost(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context,
    hostRegex: RegExp) {
    if (req.url) {
        let url = new URL(req.url, `${ctx['scheme']}://${req.headers.host}`);
        ctx['url'] = url;
        return hostRegex.test(url.hostname);
    }
    return false;
});

let matchMethod = createRoute<T, [methodRegex: RegExp]>(function matchMethod(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context,
    methodRegex: RegExp
) {
    if (req.method) {
        return methodRegex.test(req.method);
    }
    return false;
});

let matchPath = createRoute<T, [pathRegex: RegExp]>(function matchPath(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context,
    pathRegex: RegExp
) {
    if (ctx?.url?.pathname) {
        return pathRegex.test(ctx.url.pathname);
    }
    return false;
});


let getResource = createRoute<T, never>(function getResource(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: Context
) {
    let body = 'TEST';

    log.info(body);

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });

    res.end(body);
});


let handler = new ConsoleHandler<string, string>();
handler.setLevel(Level.DEBUG);
let formatter = new Formatter<string, string>(
    (message: string, { level, func, url, line, col }: IMeta): string => {
        url = url?.replace(/^.*\/(.*)$/, '$1');
        return `${level}:${new Date().toISOString()}:${url}:${func}:${line}:${col}:${message}`;
    });
handler.setFormatter(formatter);
log.addHandler(handler);

let router = httpAdapter(
    logRequest(log.debug)(
        matchHost(/^farar\.net$/)(
            matchSchemePort('http', 3000)(
                matchMethod(/GET/)(
                    matchPath(/\/page/)(
                        getResource
                    ),
                    matchPath(/\/api/)(
                        getResource
                    )
                )
            ),
            matchSchemePort('https', 3443)(

            )
        )
    )
);

http.createServer(router).listen({ port: 3000 });
