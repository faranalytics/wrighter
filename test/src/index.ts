import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';

import { createRoute } from 'wrighter';

type T = [
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any }
]

let matchScheme = createRoute<T, [scheme: string, port: number]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    scheme: string,
    port: number
) => {

    if (req.url) {

        let _scheme = Object.hasOwn(req.socket, 'encrypted') ? 'https': 'http';

        let url = new URL(req.url, `${_scheme}://${req.headers.host}`);

        ctx.url = url;

        return scheme === _scheme && port === parseInt(url.port);
    }
    return false;
});

let matchHost = createRoute<T, [regex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    regex: RegExp) => {

    if (req.url) {
        let url = new URL(req.url, `${ctx['scheme']}://${req.headers.host}`);
        ctx['url'] = url;
        return regex.test(url.hostname);
    }
    else {
        return false;
    }
});

let matchMethod = createRoute<T, [regex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    regex: RegExp
) => {

    if (req.method) {
        return regex.test(req.method);
    }
    else {
        return false;
    }
});

let matchPath = createRoute<T, [regex: RegExp]>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    regex: RegExp
) => {
    if (ctx?.url?.pathname) {
        return regex.test(ctx.url.pathname);
    }
    else {
        return false;
    }
});

let root = createRoute<T, never>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: any
) => {
    return true;
})();

let resource = createRoute<T, never>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
) => {

    let body = 'TEST';

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });

    res.end(body);

    return true;
});


let router = root(

    matchScheme('http', 3000)(

        matchHost(/^farar\.net$/)(

            matchMethod(/GET/)(

                matchPath(/\/page/)(
                    resource()()
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
            let result = await router(req, res, {})
        }
        catch (e) {
            console.error(e);
        }
    });
})();
