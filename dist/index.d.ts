export { logger } from 'memoir';
export { accept, deny } from './symbols.js';
export declare function createHandler<ArgsT extends Array<any>, ReturnT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => ReturnT): (...args: ArgsT) => (...routeArgs: Array<any>) => Promise<any>;
export declare function createRoute<ArgsT extends Array<any>, ReturnT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => ReturnT): (...args: ArgsT) => (...routes: (((...routeArgs: Array<any>) => Promise<any>) | ((...routeArgs: Array<any>) => Promise<any>)[])[]) => ReturnT;
//# sourceMappingURL=index.d.ts.map