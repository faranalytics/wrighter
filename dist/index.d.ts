export { logger } from 'memoir';
export { accept, deny } from './symbols.js';
export declare function createHandler<ArgsT extends Array<any>, HandlerT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => HandlerT): (...args: ArgsT) => HandlerT;
export declare function createRoute<ArgsT extends Array<any>, RouterT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => RouterT): (...args: ArgsT) => (...routes: Array<RouterT | Array<RouterT>>) => RouterT;
export declare function createTransformer<ArgsT extends Array<any>, RouterT extends (...args: Array<any>) => Promise<any>, TransformT extends (...args: Array<any>) => Promise<any>>(fn: (...args: ArgsT) => (forward: TransformT, ...args: any) => Promise<any>): (...args: ArgsT) => (...routes: Array<TransformT | Array<TransformT>>) => RouterT;
//# sourceMappingURL=index.d.ts.map