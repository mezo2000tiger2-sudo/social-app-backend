"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const config_service_js_1 = require("../config/config.service.js");
class RedisService {
    redis_client;
    encode = (value) => JSON.stringify(value);
    decode = (raw) => (raw === null ? null : JSON.parse(raw));
    constructor() {
        this.redis_client = (0, redis_1.createClient)({ url: config_service_js_1.REDIS_URI });
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
    setValue = async ({ key, value, ttl }) => {
        const options = ttl ? { EX: ttl } : undefined;
        return this.redis_client.set(key, this.encode(value), options);
    };
    updateValue = async ({ key, value, ttl }) => {
        const options = ttl
            ? { XX: true, EX: ttl }
            : { XX: true, KEEPTTL: true };
        const result = await this.redis_client.set(key, this.encode(value), options);
        return result === "OK";
    };
    getValue = async ({ key }) => this.decode(await this.redis_client.get(key));
    getTTL = async ({ key }) => {
        const seconds = await this.redis_client.ttl(key);
        return seconds;
    };
    expire = async ({ key, ttl }) => {
        return await this.redis_client.expire(key, ttl);
    };
    deleteKey = async (key) => {
        return await this.redis_client.del(key);
    };
    keys = async (key) => {
        return await this.redis_client.keys(`${key}*`);
    };
    incr = async (key) => {
        return await this.redis_client.incr(key);
    };
    exists = async (key) => {
        return await this.redis_client.exists(key);
    };
}
exports.RedisService = RedisService;
exports.default = new RedisService();
//# sourceMappingURL=connectRedis.js.map