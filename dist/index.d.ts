export { logger } from 'memoir';
export { ACCEPT, DENY, accept, deny } from './symbols.js';
export declare function createRoute<ArgsT extends Array<any>, ReturnT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => ReturnT): (...args: ArgsT) => (..._routes: (((...routeArgs: Array<any>) => Promise<any>) | any | any | (((...routeArgs: Array<any>) => Promise<any>) | any | any)[])[]) => ReturnT;
//# sourceMappingURL=index.d.ts.map