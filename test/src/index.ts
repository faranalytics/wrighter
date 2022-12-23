import * as http from 'node:http';
import * as util from 'node:util';
import { ListenOptions } from 'node:net';

import { create } from 'wrighter';

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

let resource = create((...args) => {
    console.log(args);
    return true;
});


let route = matchHost('localhost')(

    matchMethod('GET')(

        resource
    )
);

(async () => {

    let result = await route({ host: 'localhost', method: 'GET' }, {}, {})

    console.log(result);
})();

