import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';
import { HTTP404Response, HTTP500Response, HTTPResponse } from './http_responses.js';
import { createRoute } from 'wrighter';

type T = [
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any }
]

let root = createRoute<T, never>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: any
) => {
    let _scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';
    console.log(`${_scheme}://${req.headers.host}${req.url}`);
    return true;
})();

let matchScheme = createRoute<T, [scheme: string, port: number]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    scheme: string,
    port: number
) => {

    console.log('matchScheme');

    if (req.url) {

        let _scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https' : 'http';

        let url = new URL(req.url, `${_scheme}://${req.headers.host}`);

        ctx.url = url;

        return scheme === _scheme && port === req.socket.localPort;
    }

    return false;
});

let matchHost = createRoute<T, [hostRegex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    hostRegex: RegExp) => {

    console.log('matchHost');

    if (req.url) {
        let url = new URL(req.url, `${ctx['scheme']}://${req.headers.host}`);
        ctx['url'] = url;
        return hostRegex.test(url.hostname);
    }
    else {
        return false;
    }
});

let matchMethod = createRoute<T, [methodRegex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    methodRegex: RegExp
) => {

    console.log('matchMethod');

    if (req.method) {
        return methodRegex.test(req.method);
    }
    else {
        return false;
    }
});

let matchPath = createRoute<T, [pathRegex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    pathRegex: RegExp
) => {

    console.log('matchPath');

    if (ctx?.url?.pathname) {
        return pathRegex.test(ctx.url.pathname);
    }
    else {
        return false;
    }
});


let resource = createRoute<T, never>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any }
) => {

    console.log('resource');

    let body = 'TEST';

    console.log(body);

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });

    res.end(body);

    return null;
});

let router = root(

    matchScheme('http', 3000)(

        matchHost(/^farar\.net$/)(

            matchMethod(/GET/)(
        
                matchPath(/\/page/)(
        
                    resource
                )
            )
        )
    ),

    matchScheme('https', 3443)(

        matchHost(/^farar\.net$/)(

            matchMethod(/GET/)(
        
                matchPath(/\/page/)(
        
                    resource
                )
            )
        )
    )
);

(async () => {

    let options: ListenOptions = { port: 3000 };

    let server = new http.Server().listen(options);

    server.addListener('request', async (req: http.IncomingMessage, res: http.ServerResponse) => {

        try {
            let result = await router(req, res, {});

            if (result === false) {
                throw new HTTP404Response();
            }
        }
        catch (e) {
            if (e instanceof HTTPResponse) {
                res.writeHead(e.code, {
                    'Content-Length': Buffer.byteLength(e.message),
                    'Content-Type': 'text/html'
                });

                res.end(e.message);
            }
            else {
                throw e;
            }
        }
    });
})();
