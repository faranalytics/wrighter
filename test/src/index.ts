import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';

import { createRoute } from 'wrighter';

type S = [
    http.IncomingMessage,
    http.ServerResponse,
    { [key: string]: any }
]


let matchScheme = createRoute<[string], S>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: string
) => {

    if (match == 'https') {
        return Object.hasOwn(req.socket, 'encrypted')
    }
    else if (match == 'http') {
        return !Object.hasOwn(req.socket, 'encrypted')
    }
    else {
        throw new Error();
    }
    return true;
});

// let matchHost = createRoute((req: any, res: any, ctx: any, match: string) => {

//     if (match.match(req.host)) {
//         return true;
//     }
//     else {
//         return false;
//     }
// });


// let matchMethod = createRoute((req: any, res: any, ctx: any, match: string) => {

//     if (match.match(req.method)) {
//         return true;
//     }
//     else {
//         return false;
//     }
// });

// let matchPath = createRoute((req: any, res: any, ctx: any, path: string) => {
//     console.log(path)
//     return req.path == path;
// });


let root = createRoute<[any], S>((
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: { [key: string]: any },
    match: any
) => {
    return true;
})(null);

// let paths = [
//     matchPath('/test1'),
//     matchPath('/test0'),
//     matchPath('/test3')
// ]

let route = root(

    matchScheme('https')(

        //     matchHost('localhost')(

        //         matchMethod('GET')(

        //             paths
        //         )
        //     )
    )
);

(async () => {

    let options: ListenOptions = {};

    let server = new http.Server().listen(options);

    server.addListener('request', async (req: http.IncomingMessage, res: http.ServerResponse) => {
        let result = await route(req, res, {})

    });
    
    // console.log(result);

    // paths.unshift(matchPath('/test2'));

    // result = await route({ host: 'localhost', method: 'GET', socket: { 'encrypted': null }, path: '/test0' }, '', {})
    // console.log(result);
})();


