import { createClient, type RedisClientType } from "redis";
import { REDIS_URI } from "../config/config.service.js";

export class RedisService {
    private redis_client: RedisClientType;
    private encode = (value: unknown) => JSON.stringify(value);
    private decode = (raw: string | null) => (raw === null ? null : JSON.parse(raw));

    constructor() {
        this.redis_client = createClient({ url: REDIS_URI });
        this.handleEvents();
    }
    handleEvents = () => {
        this.redis_client.on("error", (error) => {
            console.error(`Redis error: ${error.message}`);
        });
    };
    Connect_Redis = async () => {
        await this.redis_client.connect();
        console.log("Connected to Redis");
    };



    setValue = async ({ key, value, ttl }: { key: string; value: unknown; ttl?: number }) => {
        const options = ttl ? { EX: ttl } : undefined;
        return this.redis_client.set(key, this.encode(value), options);
    };
    updateValue = async ({ key, value, ttl }: { key: string; value: unknown; ttl?: number }) => {
        const options = ttl
            ? { XX: true, EX: ttl }
            : { XX: true, KEEPTTL: true };
        const result = await this.redis_client.set(key, this.encode(value), options);
        return result === "OK";
    };

    getValue = async ({ key }: { key: string }) => this.decode(await this.redis_client.get(key));

    getTTL = async ({ key }: { key: string }) => {
        const seconds = await this.redis_client.ttl(key);
        return seconds;
    };

    expire = async ({ key, ttl }: { key: string; ttl: number }) => {
        return await this.redis_client.expire(key, ttl);
    };

    deleteKey = async (key: string) => {
        return await this.redis_client.del(key);
    };

    keys = async (key: string) => {
        return await this.redis_client.keys(`${key}*`);
    };

    incr = async (key: string) => {
        return await this.redis_client.incr(key);
    };

    exists = async (key: string) => {
        return await this.redis_client.exists(key);
    };
}

export default new RedisService();
