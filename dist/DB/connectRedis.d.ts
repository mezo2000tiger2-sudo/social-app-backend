export declare class RedisService {
    private redis_client;
    private encode;
    private decode;
    constructor();
    handleEvents: () => void;
    Connect_Redis: () => Promise<void>;
    setValue: ({ key, value, ttl }: {
        key: string;
        value: unknown;
        ttl?: number;
    }) => Promise<string | null>;
    updateValue: ({ key, value, ttl }: {
        key: string;
        value: unknown;
        ttl?: number;
    }) => Promise<boolean>;
    getValue: ({ key }: {
        key: string;
    }) => Promise<any>;
    getTTL: ({ key }: {
        key: string;
    }) => Promise<number>;
    expire: ({ key, ttl }: {
        key: string;
        ttl: number;
    }) => Promise<number>;
    deleteKey: (key: string) => Promise<number>;
    keys: (key: string) => Promise<string[]>;
    incr: (key: string) => Promise<number>;
    exists: (key: string) => Promise<number>;
}
declare const _default: RedisService;
export default _default;
//# sourceMappingURL=connectRedis.d.ts.map