import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';

import { create } from 'wrighter';

let matchScheme = create((req: any, res: any, ctx: any, match: string) => {
    
    if (match == 'https') {
        return Object.hasOwn(req.socket, 'encrypted')
    }
    else if (match == 'http') {
        return !Object.hasOwn(req.socket, 'encrypted')
    }
    else {
        throw new Error();
    }
});

let matchHost = create((req: any, res: any, ctx: any, match: string) => {

    if (match.match(req.host)) {
        return true;
    }
    else {
        return false;
    }
});


let matchMethod = create((req: any, res: any, ctx: any, match: string) => {

    if (match.match(req.method)) {
        return true;
    }
    else {
        return false;
    }
});

let matchPath = create((req: any, res: any, ctx: any, path: string) => {
    console.log(path)
    return req.path == path;
});

let root = create((req: any, res: any, ctx: any) => {
    return true;
})();

let paths = [
    matchPath('/test1'),
    matchPath('/test0'),
    matchPath('/test3')
]

let route = root(

    matchScheme('https')(

        matchHost('localhost')(

            matchMethod('GET')(

                paths
            )
        )
    )
);

(async () => {

    let result = await route({ host: 'localhost', method: 'GET', socket: { 'encrypted': null }, path: '/test0' }, {}, {})
    console.log(result);

    paths.unshift(matchPath('/test2'));

    result = await route({ host: 'localhost', method: 'GET', socket: { 'encrypted': null }, path: '/test0' }, {}, {})
    console.log(result);
})();

