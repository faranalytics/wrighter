export declare function createRoute<S extends Array<any>, T extends Array<any>>(handler: (...args: [...S, ...T]) => boolean | void | null): (...routeArgs: T) => (..._routes: (any | any | ((...args: S) => Promise<boolean | void | null>) | (any | any | ((...args: S) => Promise<boolean | void | null>))[])[]) => (...args: S) => Promise<boolean | void | null>;
//# sourceMappingURL=index.d.ts.map