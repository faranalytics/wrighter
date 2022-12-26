import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';

import { createRoute } from 'wrighter';

type S = [
    http.IncomingMessage,
    http.ServerResponse,
    { [key: string]: any }
]

let matchScheme = createRoute<S, [string]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: string
) => {

    if (match == 'https') {
        ctx['scheme'] = 'https';
        return Object.hasOwn(req.socket, 'encrypted')
    }
    else if (match == 'http') {
        ctx['scheme'] = 'http';
        return !Object.hasOwn(req.socket, 'encrypted')
    }
    else {
        throw new Error();
    }

    return false;
});

let matchHost = createRoute<S, [RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: RegExp) => {

    if (req.url) {
        let url = new URL(req.url, `${ctx['scheme']}://${req.headers.host}`);
        ctx['url'] = url;
        return match.test(url.hostname);
    }
    else {
        return false;
    }
});

let matchMethod = createRoute<S, [RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: RegExp
) => {

    if (req.method) {
        return match.test(req.method);
    }
    else {
        return false;
    }
});

let matchPath = createRoute<S, [RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: RegExp
) => {
    if (ctx?.url?.pathname) {
        return match.test(ctx.url.pathname);
    }
    else {
        return false;
    }
});

let root = createRoute<S, [any]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: any
) => {
    return true;
})(null);

let resource = createRoute<S, [any]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: any
) => {

    let body = 'TEST';

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });

    res.end(body);

    return true;
});

let paths: Array<any> = [];

paths.push(
    matchPath(/\/page/)(
        resource
    )
)

let router = root(

    matchScheme('http')(

        matchHost(/^farar\.net$/)(

            matchMethod(/GET/)(
                paths
            )
        )
    )
);

(async () => {

    let options: ListenOptions = { port: 3000 };

    let server = new http.Server().listen(options);

    server.addListener('request', async (req: http.IncomingMessage, res: http.ServerResponse) => {

        try {
            let result = await router(req, res, {})
        }
        catch(e){
            console.error(e);
        }
    });
})();


